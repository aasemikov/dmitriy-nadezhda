// ==================== PRELOADER ====================
(function () {
    // Отключаем автоматическое восстановление позиции скролла браузером
    // Это нужно, чтобы при обновлении страницы пользователь всегда оказывался в начале
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Принудительно скроллим в начало страницы сразу при загрузке
    window.scrollTo(0, 0);

    // Добавляем класс для скрытия контента при загрузке
    document.body.classList.add('preloading');

    // Минимальное время показа прелоадера
    const MIN_DISPLAY_TIME = 5000;
    const startTime = Date.now();

    // Функция скрытия прелоадера
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

        setTimeout(function () {
            // Принудительно скроллим в начало ПЕРЕД анимацией отрывания
            // Это гарантирует, что пользователь увидит начало сайта после исчезновения прелоадера
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            // Запускаем анимацию отрывания
            preloader.classList.add('preloader--hidden');
            document.body.classList.remove('preloading');

            // Удаляем прелоадер из DOM после завершения анимации
            setTimeout(function () {
                preloader.remove();
                // Разрешаем скролл
                document.body.style.overflow = '';

                // Финальный скролл в начало после полного удаления прелоадера
                window.scrollTo(0, 0);
            }, 1500);
        }, remainingTime);
    }

    // Ждем полной загрузки всех ресурсов (картинок, шрифтов)
    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
    }

    // Fallback: если что-то пошло не так, скрываем прелоадер через 7 секунд
    setTimeout(function () {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('preloader--hidden')) {
            hidePreloader();
        }
    }, 7000);
})();