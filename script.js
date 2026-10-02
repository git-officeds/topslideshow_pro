'use strict';

(() => {
    // トップスライドショー本体
    const topslideshow = document.querySelector('.topslideshow');
    if (!topslideshow) return;

    const slides = topslideshow.querySelectorAll('.slides');
    const prevBtn = topslideshow.querySelector('.handler .prev');
    const nextBtn = topslideshow.querySelector('.handler .next');
    const dots = topslideshow.querySelectorAll('.indicator .dot');

    if (slides.length === 0) return;

    const AUTO_INTERVAL = 5000; // 自動切替の間隔（ミリ秒）
    // HTMLにあらかじめ「show」が付いているスライドを現在位置とする（無ければ先頭）
    let currentIndex = Math.max(0, [...slides].findIndex(slide => slide.classList.contains('show')));
    let autoTimer = null;

    // スライド表示時のフロートインアニメーションを再生する
    const playInAnimation = (slide) => {
        const contents = slide.querySelector('.contents');
        const img = slide.querySelector('img');

        // 前回表示時の「showed」（フロートイン完了後の演出）をリセット
        slide.classList.remove('showed');

        [contents, img].forEach(el => {
            if (!el) return;
            el.classList.remove('float-in');
            void el.offsetWidth; // リフローを強制し、アニメーションを再度発火させる
            el.classList.add('float-in');
        });

        // テキストのフロートインが終わったタイミングで「showed」を付与し、
        // CSS側の完了後アニメーション（infinit_float等）を開始させる
        if (contents) {
            contents.addEventListener('animationend', () => {
                slide.classList.add('showed');
            }, { once: true });
        }
    };

    // 指定インデックスのスライドへ切り替える
    const goToSlide = (index) => {
        const total = slides.length;
        const newIndex = (index + total) % total; // マイナスや範囲外もループさせる

        if (newIndex === currentIndex) return;

        // 現在のスライドを非表示にし、インジケーターの選択状態も解除
        slides[currentIndex].classList.remove('show', 'showed');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

        currentIndex = newIndex;

        // 新しいスライドを表示し、インジケーターを連動させる
        slides[currentIndex].classList.add('show');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');

        playInAnimation(slides[currentIndex]);
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    // 自動切替タイマーを開始
    const startAutoSlide = () => {
        autoTimer = setInterval(nextSlide, AUTO_INTERVAL);
    };

    // 手動操作があった場合に自動切替のカウントをリセットする
    const resetAutoSlide = () => {
        clearInterval(autoTimer);
        startAutoSlide();
    };

    // 「次へ」ボタン
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    // 「前へ」ボタン
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    // インジケーター（各ドット）クリックで該当スライドへジャンプ
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetAutoSlide();
        });
    });

    // ここからスマートフォン等でのフリック（スワイプ）操作対応
    const SWIPE_THRESHOLD = 50; // スワイプと判定する最小移動距離（px）
    let touchStartX = 0;
    let touchStartY = 0;

    // タッチ開始位置を記録
    topslideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    // タッチ終了位置との差分から左右フリックを判定
    topslideshow.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        // 横方向の移動が閾値未満、または縦方向の移動の方が大きい場合はフリックとみなさない
        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;

        if (deltaX < 0) {
            nextSlide(); // 左へフリック：次のスライドへ
        } else {
            prevSlide(); // 右へフリック：前のスライドへ
        }
        resetAutoSlide();
    }, { passive: true });

    // 初期表示：最初のスライドにもフロートインアニメーションを再生させてから自動切替を開始
    slides[currentIndex].classList.add('show');
    playInAnimation(slides[currentIndex]);
    startAutoSlide();
})();
