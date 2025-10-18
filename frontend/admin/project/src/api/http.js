export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockFetch(data, delayMs = 300) {
  await delay(delayMs);
  return data;
}
