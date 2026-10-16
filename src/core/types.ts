export interface NodeDef { x: number; z: number; n: string; c: number }
export interface TruckSpec { p: string[]; c: string; l: string; d?: number; after?: number; loss?: number }
export interface Step { t: string; s: string; x: string; f: string; d: number; hl?: string[]; tr: TruckSpec[] }
export interface MoreItem { t: string; c: string }
export interface QuizItem { s: number; q: string; o: string[]; a: number; e: string }
