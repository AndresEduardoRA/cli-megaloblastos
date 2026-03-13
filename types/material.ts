export interface Material {
  id: string;
  title: string;
  type: string;
  year: number;
  subject: string;
  teacher: string;
  partial: string;
  url: string;
}

export type GetMaterialsParams = {
  search?: string;
  type?: string;
  year?: number;
  subject?: string;
  page: number;
  limit: number;
};
