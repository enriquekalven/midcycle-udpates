import '@testing-library/jest-dom'

// Mock SpeechSynthesis if needed
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn().mockReturnValue([]),
    },
    writable: true,
  });

  // @ts-ignore
  window.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => {
    return {
      text,
      lang: '',
      rate: 1,
      pitch: 1,
      volume: 1,
      onstart: null,
      onend: null,
      onerror: null,
      onpause: null,
      onresume: null,
    };
  });
}
