export function record(metric: string, data: Record<string, unknown>): void {
    console.log(`Analytics event: ${metric}`, data);
}
