import Papa from "papaparse";
import categoryMap from "@/lib/categoryMap.json";
import { extractReceipt } from "@/lib/receipts.functions";
import { TxForm } from "@/routes/_authenticated/capture"; // reuse same type

/**
 * Parse CSV file with columns: date,description,amount,category(optional)
 * Returns array of TxForm objects ready for upload.
 */
export async function parseCsv(file: File): Promise<TxForm[]> {
  const text = await file.text();
  return new Promise<TxForm[]>((resolve, reject) => {
    Papa.parse<any>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data: TxForm[] = results.data.map((row: any) => {
            // Normaliza data para ISO (dd/mm/yyyy ou yyyy-mm-dd)
            const date = normalizeDate(row.date);
            const amount = Number(row.amount).toString();
            const category = row.category || inferCategory(row.description || row.estabelecimento || "");
            const isImposto = category === "Impostos/Taxas" || ["das ", "darf", "inss", "imposto", "simples naciona"].some(kw => (row.description || row.estabelecimento || "").toLowerCase().includes(kw));
            return {
              id: crypto.randomUUID(),
              doc_type: "despesa",
              type: "expense",
              payment_method: "Cartão de Crédito",
              target_source: "",
              description: row.description || "",
              establishment: row.estabelecimento || "",
              amount,
              date,
              category,
              classification: isImposto ? "PJ" : "PF",
              cardholder: "Principal",
              confidence: null,
              sharing_type: "private",
              installments_current: null,
              installments_total: null,
              status: "pendente_revisao",
            } as TxForm;
          });
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Parse PDF or image using the existing AI extractor.
 * Returns the same TxForm[] shape as capture page.
 */
export async function parsePdfOrImage(path: string, extract: any): Promise<TxForm[]> {
  const result = await extract({ data: { path } });
  const txs = (result as any).transacoes || [];
  const parsed: TxForm[] = txs.map((t: any) => {
    const cat = t.categoria_sugerida || inferCategory(t.descricao_servico || t.estabelecimento || "");
    const isPJ = t.tipo_documento === "faturamento_pj";
    const date = parseDateString(t.data);
    return {
      id: crypto.randomUUID(),
      doc_type: t.tipo_documento || "despesa",
      type: isPJ ? "income" : "expense",
      payment_method: "Cartão de Crédito",
      target_source: isPJ ? t.estabelecimento ?? "" : "",
      description: t.descricao_servico ?? "",
      establishment: t.estabelecimento ?? "",
      amount: t.valor != null ? String(t.valor) : "0",
      date,
      category: cat as any,
      classification: t.classificacao === "PJ" ? "PJ" : "PF",
      cardholder: t.portador || "Principal",
      confidence: t.confiança ?? null,
      sharing_type: "private",
      installments_current: null,
      installments_total: null,
      status: "pendente_revisao",
    } as TxForm;
  });
  return parsed;
}

/** Normaliza datas do formato DD/MM/YYYY ou YYYY-MM-DD para ISO YYYY-MM-DD */
function normalizeDate(d: string): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  const br = d.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

/** Infer category from description using keyword map */
export function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    for (const kw of keywords as string[]) {
      if (kw && lower.includes(kw.toLowerCase())) return cat;
    }
  }
  return "Outros";
}

export function parseDateString(d: string | null | undefined): string {
  return normalizeDate(d ?? "");
}
