export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Moradia",
  "Educação",
  "Compras",
  "Cuidados Pessoais",
  "Pets",
  "Contas Fixas",
  "Cartão de Crédito",
  "Impostos/Taxas",
  "Serviços",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  "Alimentação": "#F59E0B",
  "Transporte": "#3B82F6",
  "Lazer": "#8B5CF6",
  "Saúde": "#EF4444",
  "Moradia": "#14B8A6",
  "Educação": "#F43F5E",
  "Compras": "#EC4899",
  "Cuidados Pessoais": "#D946EF",
  "Pets": "#84CC16",
  "Contas Fixas": "#10B981",
  "Cartão de Crédito": "#6366F1",
  "Impostos/Taxas": "#F97316",
  "Serviços": "#0EA5E9",
  "Outros": "#6B7280",
};

export const SOURCE_LABEL: Record<string, string> = {
  manual: "Manual",
  upload: "Upload",
  camera: "Câmera",
  email: "E-mail",
};
