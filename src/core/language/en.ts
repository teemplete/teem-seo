import type { Locale } from '../types'

export interface LanguagePack {
  locale: Locale
  stopWords: Set<string>
  transitionWords: string[]
  sentenceSplitRegex: RegExp
  /** Approximate average character width for title pixel estimate */
  titleCharWidth: number
  messages: MessagePack
}

export interface MessagePack {
  seo: {
    keyphraseMissing: string
    keyphraseTooLong: string
    keyphraseOk: string
    keyphraseInTitleGood: string
    keyphraseInTitleBad: string
    keyphraseInMetaGood: string
    keyphraseInMetaBad: string
    keyphraseInIntroGood: string
    keyphraseInIntroBad: string
    keyphraseInContentGood: string
    keyphraseInContentBad: string
    densityGood: (d: string) => string
    densityLow: (d: string) => string
    densityHigh: (d: string) => string
    keyphraseInSubheadingsGood: string
    keyphraseInSubheadingsBad: string
    keyphraseInAltGood: string
    keyphraseInAltOk: string
    keyphraseInAltBad: string
    keyphraseInSlugGood: string
    keyphraseInSlugOk: string
    keyphraseInSlugBad: string
    titleLengthGood: string
    titleLengthShort: string
    titleLengthLong: string
    titleMissing: string
    metaLengthGood: string
    metaLengthShort: string
    metaLengthLong: string
    metaMissing: string
    textLengthGood: (n: number) => string
    textLengthOk: (n: number) => string
    textLengthBad: (n: number) => string
    outboundGood: string
    outboundBad: string
    internalGood: string
    internalBad: string
    singleH1Good: string
    singleH1None: string
    singleH1Many: (n: number) => string
    subheadingGood: string
    subheadingOk: string
    subheadingBad: string
    keyphraseElsewhereBad: string
    keyphraseElsewhereGood: string
  }
  readability: {
    fleschGood: (score: number) => string
    fleschOk: (score: number) => string
    fleschBad: (score: number) => string
    sentenceGood: string
    sentenceOk: (pct: number) => string
    sentenceBad: (pct: number) => string
    paragraphGood: string
    paragraphOk: string
    paragraphBad: string
    passiveGood: string
    passiveOk: (pct: number) => string
    passiveBad: (pct: number) => string
    transitionGood: string
    transitionOk: (pct: number) => string
    transitionBad: (pct: number) => string
    consecutiveGood: string
    consecutiveBad: string
    subheadingGood: string
    subheadingOk: string
    subheadingBad: string
    persianGood: string
    persianOk: string
    persianBad: string
  }
}

const EN_STOP = [
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'not', 'no', 'yes', 'if', 'then', 'than', 'so', 'such', 'into',
  'about', 'up', 'out', 'over', 'after', 'before', 'between', 'under', 'again', 'further',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'can', 'will', 'just', 'don', 'should', 'now', 'also',
]

const EN_TRANSITIONS = [
  'accordingly', 'additionally', 'afterward', 'afterwards', 'also', 'although',
  'as a result', 'as well as', 'besides', 'consequently', 'conversely', 'despite',
  'even so', 'even though', 'finally', 'first', 'firstly', 'for example', 'for instance',
  'furthermore', 'hence', 'however', 'in addition', 'in conclusion', 'in contrast',
  'in fact', 'in other words', 'in particular', 'in short', 'in summary', 'indeed',
  'instead', 'likewise', 'meanwhile', 'moreover', 'nevertheless', 'nonetheless',
  'on the contrary', 'on the other hand', 'otherwise', 'second', 'secondly', 'similarly',
  'since', 'specifically', 'still', 'subsequently', 'that said', 'then', 'therefore',
  'thus', 'to summarize', 'ultimately', 'whereas', 'while', 'yet',
]

export const enPack: LanguagePack = {
  locale: 'en',
  stopWords: new Set(EN_STOP),
  transitionWords: EN_TRANSITIONS,
  sentenceSplitRegex: /[.!?]+(?:\s+|$)/,
  titleCharWidth: 10,
  messages: {
    seo: {
      keyphraseMissing: 'No focus keyphrase was set. Please set a focus keyphrase.',
      keyphraseTooLong: 'Your focus keyphrase is longer than 4 words. Try a shorter keyphrase.',
      keyphraseOk: 'Your focus keyphrase has a good length.',
      keyphraseInTitleGood: 'The focus keyphrase appears in the SEO title.',
      keyphraseInTitleBad: 'The focus keyphrase does not appear in the SEO title.',
      keyphraseInMetaGood: 'The focus keyphrase appears in the meta description.',
      keyphraseInMetaBad: 'The focus keyphrase does not appear in the meta description.',
      keyphraseInIntroGood: 'The focus keyphrase appears in the first paragraph.',
      keyphraseInIntroBad: 'The focus keyphrase does not appear in the first paragraph.',
      keyphraseInContentGood: 'The focus keyphrase appears in the content.',
      keyphraseInContentBad: 'The focus keyphrase does not appear in the content.',
      densityGood: (d) => `Keyphrase density is ${d}%, which is great.`,
      densityLow: (d) => `Keyphrase density is ${d}%, which is too low. Aim for 0.5%–3%.`,
      densityHigh: (d) => `Keyphrase density is ${d}%, which is too high. Aim for 0.5%–3%.`,
      keyphraseInSubheadingsGood: 'The focus keyphrase appears in at least one subheading.',
      keyphraseInSubheadingsBad: 'The focus keyphrase does not appear in any subheadings.',
      keyphraseInAltGood: 'The focus keyphrase appears in image alt attributes.',
      keyphraseInAltOk: 'Images are present but the focus keyphrase is missing from alt attributes.',
      keyphraseInAltBad: 'No images found. Add images with descriptive alt text including the keyphrase.',
      keyphraseInSlugGood: 'The focus keyphrase appears in the slug.',
      keyphraseInSlugOk:
        'The slug is Latinized. For non-Latin keyphrases this is acceptable if it reflects the topic (e.g. romanization or English equivalent).',
      keyphraseInSlugBad: 'The focus keyphrase does not appear in the slug.',
      titleLengthGood: 'The SEO title has a good length.',
      titleLengthShort: 'The SEO title is too short. Aim for about 30–60 characters.',
      titleLengthLong: 'The SEO title is too long and may be truncated in search results.',
      titleMissing: 'Please add an SEO title.',
      metaLengthGood: 'The meta description has a good length.',
      metaLengthShort: 'The meta description is too short. Aim for about 120–160 characters.',
      metaLengthLong: 'The meta description is too long and may be truncated.',
      metaMissing: 'Please add a meta description.',
      textLengthGood: (n) => `The text contains ${n} words. This is more than the recommended minimum of 300 words.`,
      textLengthOk: (n) => `The text contains ${n} words. Try to write at least 300 words.`,
      textLengthBad: (n) => `The text contains ${n} words. This is far below the recommended minimum of 300 words.`,
      outboundGood: 'Outbound links are present in the content.',
      outboundBad: 'No outbound links appear in this content. Add links to external authoritative sources.',
      internalGood: 'Internal links are present in the content.',
      internalBad: 'No internal links appear in this content. Add links to related pages on your site.',
      singleH1Good: 'The content has exactly one H1 heading.',
      singleH1None: 'No H1 heading was found. Add a single H1.',
      singleH1Many: (n) => `Found ${n} H1 headings. Use only one H1 per page.`,
      subheadingGood: 'Subheadings are well distributed throughout the text.',
      subheadingOk: 'Some sections are long. Consider adding more subheadings.',
      subheadingBad: 'Very little use of subheadings. Add H2/H3 headings to structure the text.',
      keyphraseElsewhereBad: 'This focus keyphrase has been used before. Consider a more unique keyphrase.',
      keyphraseElsewhereGood: 'This focus keyphrase has not been used on another page.',
    },
    readability: {
      fleschGood: (s) => `The copy scores ${s} in the Flesch Reading Ease test, which is considered easy to read.`,
      fleschOk: (s) => `The copy scores ${s} in the Flesch Reading Ease test, which is considered fairly difficult to read.`,
      fleschBad: (s) => `The copy scores ${s} in the Flesch Reading Ease test, which is considered difficult to read.`,
      sentenceGood: 'Sentence length is looking good.',
      sentenceOk: (pct) => `${pct}% of sentences contain more than 20 words, which is more than the recommended maximum of 25%.`,
      sentenceBad: (pct) => `${pct}% of sentences contain more than 20 words. Try to shorten your sentences.`,
      paragraphGood: 'Paragraphs are well-sized.',
      paragraphOk: 'At least one paragraph is long. Consider splitting long paragraphs.',
      paragraphBad: 'Some paragraphs are very long. Break them into shorter paragraphs.',
      passiveGood: 'You are using enough active voice.',
      passiveOk: (pct) => `${pct}% of sentences contain passive voice, which is more than the recommended maximum of 10%.`,
      passiveBad: (pct) => `${pct}% of sentences contain passive voice. Try to use more active voice.`,
      transitionGood: 'You are using enough transition words.',
      transitionOk: (pct) => `Only ${pct}% of sentences contain transition words. Aim for at least 30%.`,
      transitionBad: (pct) => `Only ${pct}% of sentences contain transition words. Add more connecting words.`,
      consecutiveGood: 'There is enough variety in sentence beginnings.',
      consecutiveBad: 'Too many consecutive sentences start with the same word. Vary your sentence openings.',
      subheadingGood: 'You are using enough subheadings.',
      subheadingOk: 'Some sections could use more subheadings.',
      subheadingBad: 'You are not using enough subheadings. Add them to improve scannability.',
      persianGood: 'Persian readability looks good based on sentence and word length.',
      persianOk: 'Persian text is fairly complex. Consider shorter sentences.',
      persianBad: 'Persian text appears hard to read. Shorten sentences and simplify wording.',
    },
  },
}
