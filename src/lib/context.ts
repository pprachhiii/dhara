interface ParamBase<T extends Record<string, string>> {
  params: Promise<T>;
}

export type Context = ParamBase<{ id: string }>;
