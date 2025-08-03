export type ImportSource = 'file' | 'url' | 'sample' | 'clipboard';

export interface ImportMetadata {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  url?: string;
  sampleName?: string;
  detectedFormat?: 'json' | 'csv' | 'xml' | 'yaml' | 'text' | 'excel';
  arrayBuffer?: ArrayBuffer;
}