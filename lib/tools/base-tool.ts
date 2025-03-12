export interface ToolResult {
    output?: string
    error?: string
    system?: string
  }
  
  export type ParameterSchema = {
    type: string;
    properties?: Record<string, {
      type?: string;
      description?: string;
      enum?: string[];
      [key: string]: unknown;
    }>;
    required?: string[];
    [key: string]: unknown;
  };
  
  export interface BaseTool {
    name: string
    description: string
    parameters: ParameterSchema
    execute(params: Record<string, unknown>): Promise<ToolResult> 
  }
  
  