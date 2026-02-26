import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    add(x: number, y: number): Promise<number>;
    divide(x: number, y: number): Promise<number>;
    divideSafe(x: number, y: number): Promise<number | null>;
    multiply(x: number, y: number): Promise<number>;
    subtract(x: number, y: number): Promise<number>;
}
