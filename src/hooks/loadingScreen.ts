export interface LoadingScreenOptions {
  loadingScreenId?: string; // ローディング画面のHTML要素ID
  mainContentId?: string; // メインコンテンツのHTML要素ID
  minDisplayTime?: number; // ローディング画面の最小表示時間（ミリ秒）
  maxDisplayTime?: number; // ローディング画面の最大表示時間（ミリ秒）
  fadeOutDuration?: number; // フェードアウトにかかる時間（ミリ秒）
  onComplete?: () => void; // ローディング完了時のコールバック関数

  progressBarId?: string; // プログレスバーのHTML要素ID
  progressTextId?: string; // プログレステキストのHTML要素ID
  trackImages?: boolean; // 画像の読み込みを追跡するかどうか
  trackResources?: boolean; // その他のリソースも追跡するかどうか

  loaderSelector?: string; // ローダー要素のCSSセレクタ
  secondProcessSelector?: string; // 2段階目の要素のCSSセレクタ
  loaderFadeDuration?: number; // ローダーのフェード時間
  secondProcessFadeDuration?: number; // 2段階目のフェード時間
  secondProcessDisplayTime?: number; // 2段階目の表示時間
  finalFadeDuration?: number; // 最終フェードアウト時間
  showOnce?: boolean; // セッション中一度だけ表示するか
}

/**
 * ローディング画面の後に
 * コンテンツ表示して
 * 最後にメインコンテンツって流れ
 */

export const initLoadingScreenWithStages = (
  options: LoadingScreenOptions = {},
) => {
  const {
    loadingScreenId = "loading-screen",
    mainContentId = "main-content",
    progressBarId = "progress-bar",
    progressTextId = "progress-text",
    loaderSelector = ".loader",
    secondProcessSelector = ".second-proccess",
    minDisplayTime = 500,
    maxDisplayTime = 8000, // 最大10秒
    loaderFadeDuration = 500,
    secondProcessFadeDuration = 800,
    secondProcessDisplayTime = 2000,
    finalFadeDuration = 1000,
    trackImages = true,
    showOnce = true, // デフォルトで一度だけ表示
    onComplete,
  } = options;

  const loadingScreen = document.getElementById(loadingScreenId);
  const mainContent = document.getElementById(mainContentId);

  if (!loadingScreen) return;

  //セッション中に既に表示済みかチェック
  if (showOnce && sessionStorage.getItem("loadingShown") === "true") {
    //即座に削除してメインコンテンツを表示
    loadingScreen.remove();
    if (mainContent) {
      mainContent.style.opacity = "1";
    }
    onComplete?.();
    return;
  }

  const progressBar = document.getElementById(progressBarId) as HTMLElement;
  const progressText = document.getElementById(progressTextId) as HTMLElement;
  const loader = document.querySelector(loaderSelector) as HTMLElement;
  const secondProcess = document.querySelector(
    secondProcessSelector,
  ) as HTMLElement;

  //2段階目を最初は非表示に
  if (secondProcess) {
    secondProcess.style.opacity = "0";
    secondProcess.style.pointerEvents = "none";
  }

  let totalResources = 0;
  let loadedResources = 0;
  let hasTransitioned = false; // 二重実行を防ぐフラグ
  const startTime = performance.now();

  const updateProgress = () => {
    const progress =
      totalResources > 0
        ? Math.round((loadedResources / totalResources) * 100)
        : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${progress}%`;
    }

    return progress;
  };

  const startStageTransition = () => {
    if (hasTransitioned) return; // 既に実行済みなら何もしない
    hasTransitioned = true;

    clearTimeout(timeoutId); // タイムアウトタイマーをクリア

    const elapsedTime = performance.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    setTimeout(() => {
      //Stage1:ローダーをフェードアウト
      if (loader) {
        loader.style.transition = `opacity ${loaderFadeDuration}ms ease-out`;
        loader.style.opacity = "0";
      }

      setTimeout(() => {
        //ローダーを削除
        loader?.remove();

        //Stage2:2段階目をフェードイン
        if (secondProcess) {
          secondProcess.style.transition = `opacity ${secondProcessFadeDuration}ms ease-in`;
          secondProcess.style.opacity = "1";
        }

        setTimeout(() => {
          //Stage3:2段階目をフェードアウト(やっぱりメインコンテンツ先に表示しておく)
          if (secondProcess) {
            secondProcess.style.transition = `opacity ${secondProcessFadeDuration}ms ease-out`;
            secondProcess.style.opacity = "0";
            loadingScreen.style.transition = `opacity ${finalFadeDuration}ms ease-out`;
            loadingScreen.style.opacity = "0";

            if (mainContent) {
              mainContent.style.transition = `opacity ${finalFadeDuration}ms ease-in`;
              mainContent.style.opacity = "1";
            }
          }

          // Stage4:全体をフェードアウトとメインコンテンツをフェードイン
          setTimeout(() => {
            //最後はローディングの要素全部消す
            setTimeout(() => {
              loadingScreen.remove();

              // 表示済みフラグを立てる
              if (showOnce) {
                sessionStorage.setItem("loadingShown", "true");
              }

              onComplete?.();
            }, finalFadeDuration);
          }, secondProcessFadeDuration);
        }, secondProcessDisplayTime);
      }, loaderFadeDuration);
    }, remainingTime);
  };

  // タイムアウトタイマーを設定
  const timeoutId = setTimeout(() => {
    console.warn(
      "Loading timeout - forcing transition after",
      maxDisplayTime,
      "ms",
    );
    startStageTransition();
  }, maxDisplayTime);

  //画像の読み込みを追跡
  if (trackImages) {
    const images = Array.from(document.images);
    totalResources = images.length;

    if (totalResources === 0) {
      startStageTransition();
      return;
    }

    images.forEach((img) => {
      if (img.complete) {
        loadedResources++;
      } else {
        img.addEventListener("load", () => {
          loadedResources++;
          const progress = updateProgress();
          if (progress === 100) {
            startStageTransition();
          }
        });
        img.addEventListener("error", () => {
          loadedResources++;
          const progress = updateProgress();
          if (progress === 100) {
            startStageTransition();
          }
        });
      }
    });

    //初期プログレスを更新
    const initialProgress = updateProgress();
    if (initialProgress === 100) {
      startStageTransition();
    }
  } else {
    //通常のload待機
    if (document.readyState === "complete") {
      startStageTransition();
    } else {
      window.addEventListener("load", startStageTransition);
    }
  }
};
