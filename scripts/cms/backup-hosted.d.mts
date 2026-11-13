/** Typed API for the standalone Node.js read-only hosted backup helper. */
export const PROJECT_REF: string;
export type HostedPgTarget = {host:string; user:string; port?:number; database?:string};
export function validateTarget(input:HostedPgTarget): {host:string;user:string;port:number;database:string};
export function inspectArchiveList(content:string): {complete:boolean;missing:string[];entries:number};
