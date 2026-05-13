const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function* fakeAiStream(prompt: string) {
  const tokens = [
    'Processing',
    'prompt:',
    prompt,
    'with',
    'realtime',
    'streaming',
    'response.',
  ];

  for (const token of tokens) {
    await delay(400);

    yield token;
  }
}
