import { hashStringToUint32 } from './hash'

const QUOTES = [
  '今天也要把“我们”放在心里最亮的位置。',
  '别赶路，慢慢靠近彼此就是最浪漫的速度。',
  '把小事过成星光，我们就拥有了整个宇宙。',
  '记得说谢谢，也记得说我爱你。',
  '不需要完美，只要真诚与耐心。',
  '今天的你值得一个温柔的拥抱。',
  '给彼此一点空间，也给彼此一点确定。',
  '把情绪说出来，比憋着更接近爱。',
  '一起做饭、一起散步，这些就是永恒。',
  '你在身边，日子就会发光。',
]

export function dailyQuote(seedKey: string) {
  const idx = hashStringToUint32(seedKey) % QUOTES.length
  return QUOTES[idx]!
}


