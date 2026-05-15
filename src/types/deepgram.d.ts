export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
  speaker_confidence?: number;
  punctuated_word?: string;
}

export interface DeepgramUtterance {
  start: number;
  end: number;
  confidence: number;
  channel: number;
  transcript: string;
  words: DeepgramWord[];
  speaker?: number;
  id: string;
}

export interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words: DeepgramWord[];
  paragraphs?: {
    transcript: string;
    paragraphs: {
      sentences: {
        text: string;
        start: number;
        end: number;
      }[];
      speaker: number;
      num_words: number;
      start: number;
      end: number;
    }[];
  };
  entities?: {
    label: string;
    value: string;
    raw_value: string;
    confidence: number;
    start_word: number;
    end_word: number;
  }[];
  summaries?: {
    summary: string;
    start_word: number;
    end_word: number;
  }[];
  topics?: {
    text: string;
    start_word: number;
    end_word: number;
    topics: string[];
  }[];
}

export interface DeepgramChannel {
  search?: {
    query: string;
    hits: {
      confidence: number;
      start: number;
      end: number;
      snippet: string;
    }[];
  }[];
  alternatives: DeepgramAlternative[];
  detected_language?: string;
}

export interface DeepgramResponse {
  metadata: {
    transaction_key: string;
    request_id: string;
    sha256: string;
    created: string;
    duration: number;
    channels: number;
    models: string[];
    model_info: Record<
      string,
      {
        name: string;
        version: string;
        arch: string;
      }
    >;
    summary_info?: any;
    sentiment_info?: any;
    topics_info?: any;
    intents_info?: any;
    tags?: string[];
  };
  results: {
    channels: DeepgramChannel[];
    utterances?: DeepgramUtterance[];
    summary?: {
      result: string;
      short: string;
    };
    topics?: any;
    intents?: any;
    sentiments?: any;
  };
}
