'use strict';

document.addEventListener('DOMContentLoaded', () => {
  class Puzzle {
    constructor() {
      this.puzzleType = [
        this.numbers(-100, 201),
        this.alphabets(),
        this.sizes(),
        this.digits()
      ];
      this.puzzle; // this.puzzleTypeから選択された配列
      this.randPanels; // this.puzzleからランダムに選択されたmin~max個の要素による配列
      this.panels; // this.randPanelsを正解順に並び替えた配列
      this.minPanels = 5; // 一度に並べる最小のパネル数
      this.maxPanels = 9; // 一度に並べる最大のパネル数
    }

    // xからy個の連番
    numbers(x, y) {
      return [...Array(y).keys()].map(i => i + x)
    }
    // アルファベット
    alphabets() {
      return 'ABCDEFGHIJKLMNOPQRSTUXWXYZ'.split('');
    }
    // 服のサイズ
    sizes() {
      return ['XS', 'S', 'M', 'L', 'XL', '3L'];
    }
    // 桁数
    digits() {
      return ['毛', '厘', '分', '一', '十', '百', '千', '万', '億', '兆', '京', '垓'];
    }

    rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // this.puzzleTypeからパズルをランダム選択し、this.puzzleに格納
    puzzleChoice() {
      const n = this.rand(0, this.puzzleType.length - 1);
      this.puzzle = this.puzzleType[n];
    }

    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const J = Math.floor(Math.random() * (i + 1));
        [arr[J], arr[i]] = [arr[i], arr[J]];
      }
      return arr;
    }

    // min~max個の要素をthis.puzzleから取得し、this.randPanelsに格納
    panelChoice() {
      let n;
      do {
        n = this.rand(this.minPanels, this.maxPanels);
      } while (n > this.puzzle.length);
      
      this.randPanels = this.shuffle([...this.puzzle]).slice(0,n);
    }

    // this.randPanelsを正解順に並べ替えてthis.panelsに格納
    sortPanels() {
      this.panels = [...this.randPanels].sort((a, b) => 
      this.puzzle.indexOf(a) - this.puzzle.indexOf(b));
    }
    
    // this.panelsに正解順に並んだパネルを格納
    prePuzzle() {
      this.puzzleChoice();
      this.panelChoice();
      this.sortPanels();
    }

    getPanels() {
      return this.panels;
    }
  }

  class Panel {
    constructor() {
      this.puzzle = new Puzzle();
      this.panels;
      this.splitNum = 3; // panelを配置する際の縦横の分割数（n * n）
      this.posNums = []; // [x, y]形式でn * nを配列で表現
      this.boardWidth = 600;
      this.boardHeight = 600;
      this.minPanelSize = 80;
      this.maxPanelSize = 180;
      this.targets = []; // 最終的に使用するパネル配列
    }

    // this.splitNumの数の分割数ををthis.posNumbersに代入[x, y]
    split() {
      let arr = [];
      for (let x = 0; x < this.splitNum; x++) {
        for (let y = 0; y < this.splitNum; y++) {
          arr.push([x, y]);
        }
      }
      this.posNums = this.puzzle.shuffle(arr);
    }

    randColor() {
      return Math.floor(Math.random() * 12) * 30;
    }

    // パネルのスタイルを整備
    panelStyle(panel, n) {
      const w = this.boardWidth / this.splitNum;
      const h = this.boardHeight / this.splitNum;

      const nx = this.posNums[n][0];
      const ny = this.posNums[n][1];

      const s = this.puzzle.rand(this.minPanelSize, this.maxPanelSize);
      const x = this.puzzle.rand(w * nx + 1, w * (1 + nx) - s - 1);
      const y = this.puzzle.rand(h * ny + 1, h * (1 + ny) - s - 1);

      panel.textContent = this.panels[n];
      panel.classList.add('panel');
      panel.style.width = s + 'px';
      panel.style.height = s + 'px';
      panel.style.lineHeight = s + 'px';
      panel.style.fontSize = Math.floor(s / 3) + 'px';
      panel.style.top = x + 'px';
      panel.style.left = y + 'px';
      panel.style.backgroundColor = 'hsla(' + this.randColor() + ', 80%, 50%, 1)';
    }

    createPanel(n) {
      const panel = document.createElement('div');
      this.panelStyle(panel, n);
      return panel;
    }

    // スタイルを整備したパネルを生成し、this.targets.に格納
    prePanel() {
      this.puzzle.prePuzzle();
      this.panels = this.puzzle.getPanels();
      this.split();
      for (let i = 0, len = this.panels.length; i < len; i++) {
        this.targets.push(this.createPanel(i));
      }
    }

    getTargets() {
      return this.targets;
    }
  }

  class Game {
    constructor() {
      this.panel = new Panel();
      this.targets = [];

      this.board = document.getElementById('board');
      this.scoreCount;
      this.score =  document.getElementById('score');
      this.correct;
      this.miss;
      this.timeLimit = 1 * 60 * 1000;
      this.startTime;
      this.startBtn = document.getElementById('startBtn');
    }

    // パネルをクリックした際の挙動
    lowShift() {
      let correctIndex = 0;
      this.targets.forEach((target, index) => {
        this.board.appendChild(target);
        target.addEventListener('click', () => {
          if (index === correctIndex) {
            target.style.display = 'none';
            correctIndex++;
            this.scoreCount++;
            this.score.textContent = 'Score : ' + String(this.scoreCount).padStart(3, '0');
            this.correct++;
            if (correctIndex === this.targets.length) {
              this.scoreCount += 3;
              this.score.textContent = 'Score : ' + String(this.scoreCount).padStart(3, '0');
              this.display();
            }
          } else {
            this.miss++;
            this.display();
          }
        });
      })
    }

    // 全正解もしくは誤答時にボードをクリア
    clearPanel() {
      while(this.board.firstChild) {
        this.board.removeChild(this.board.firstChild);
      }
      while(this.targets.length > 0) {
        this.targets.shift();
      }
    }

    // 新たなステージを表示
    display() {
      this.clearPanel();
      this.panel.prePanel();
      this.targets = this.panel.getTargets();
      this.lowShift();
    }

    // リザルト画面を表示
    resultDisplay() {
      const resultBack = document.getElementById('resultBack');
      const result = document.getElementById('result');
      const resultScore = document.getElementById('resultScore');
      const accuracy = document.getElementById('accuracy');
      const acc = (this.correct / (this.correct + this.miss) * 100).toFixed(2);
      resultBack.classList.remove('disabled');
      result.classList.add('resultActive');
      resultScore.textContent = 'Score : ' + String(this.scoreCount).padStart(3, '0');
      accuracy.textContent = `Correct : ${this.correct} | Miss : ${this.miss} | accuracy : ${isNaN(acc) ? 0 : acc}%`;
    }

    // タイマーを制御
    countDown() {
      const timer =  document.getElementById('timer');
      const d = new Date(this.timeLimit + this.startTime - Date.now());
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      timer.textContent = `${m}:${s}.${ms}`;
    
      const timeoutId = setTimeout( () => {
        this.countDown();
      },10);
    
      if (d < 0) {
        clearTimeout(timeoutId);
        timer.textContent = '00:00.000';
        this.resultDisplay();
      }
    }

    // ステージ切り替え時の初期化
    init() {
      this.scoreCount = 0;
      this.correct = 0;
      this.miss = 0;
      this.startTime = Date.now();
      this.startBtn.classList.add('disabled');
    }
    
    // スタートボタン後の挙動（初期化、タイマー開始、ステージ表示）
    gameStart() {
      this.startBtn.addEventListener('click', () => {
        this.init();
        this.countDown();
        this.display();
      });
    }
  }
  
  new Game().gameStart();

});
