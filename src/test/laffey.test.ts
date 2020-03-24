import 'jest';
import {build} from '../op/build';
import {Analecta} from '../exp/analecta';

const testData: Analecta = {
  Subscribe: 'ベンソン級駆逐艦ラフィー、命令を待っている……',
  Unsubscribe: 'わたしがこの体じゃなくなっても、まだ見てくれるの……？',
  BringIssue: '指揮官に、メール……',
  BringPR: 'コードレビュー終わったら、一緒にワイン飲もう……',
  EnumIssue: 'まだ任務がありそう……',
  EnumPR: 'うん……そこそこ……？',

  Failure: [
    'ラフィー、よくわからない……',
    '今日、何かしないといけないこと……覚えていない……',
    'ラフィーは指揮官が悪いなんて思ってない。うん、思ってない…(ツンツン'
  ],

  Flavor: [
    'Zzz……',
    '指揮官、一緒にねんねする？',
    'うん……二度寝しよう……',
    '指揮官、疲れた？',
    '指揮官、元気？'
  ]
};

test('Build', (done) => {
  build(
    {
      load: async () => testData
    },
    {
      present: async (analecta) => {
        expect(analecta).toBe(testData);
        done();
      }
    }
  );
});
