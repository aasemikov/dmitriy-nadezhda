// ==================== КОНФИГУРАЦИЯ GITHUB ====================
const GITHUB_CONFIG = {
    owner: 'aasemikov',           // Замените на ваш логин GitHub
    repo: 'form-result-dimnad',       // Замените на название репозитория
    path: 'guest.csv',           // Путь к файлу в репозитории
    token: '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' // Замените на ваш токен
};

// ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С GITHUB API ====================

/**
 * Получает текущее содержимое файла и его SHA
 */
async function getFileData() {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка получения файла: ${response.status}`);
    }

    const data = await response.json();

    // Декодируем содержимое из base64
    const content = decodeURIComponent(escape(atob(data.content)));

    return {
        content: content,
        sha: data.sha
    };
}

/**
 * Обновляет файл на GitHub (добавляет новую строку)
 */
async function updateFile(newLine, currentContent, sha) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;

    // Добавляем новую строку к существующему содержимому
    const updatedContent = currentContent + newLine;

    // Кодируем в base64 (GitHub требует base64)
    const encodedContent = btoa(unescape(encodeURIComponent(updatedContent)));

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Добавлен гость: ${newLine.split(';')[0]}`,
            content: encodedContent,
            sha: sha
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка обновления файла: ${errorData.message}`);
    }

    return await response.json();
}

/**
 * Сохраняет данные гостя в CSV файл на GitHub
 */
async function saveGuestToCSV(guestData) {
    try {
        // Получаем текущее содержимое файла и SHA
        const fileData = await getFileData();

        // Формируем строку в формате: Имя;Алкоголь;Придет;Дата
        const newLine = `${guestData.name};${guestData.alcohol};${guestData.tomorrow};${guestData.date}\n`;

        // Обновляем файл на GitHub
        await updateFile(newLine, fileData.content, fileData.sha);

        console.log('Данные успешно сохранены на GitHub');
        return true;
    } catch (error) {
        console.error('Ошибка при сохранении:', error);
        throw error;
    }
}

// ==================== ОБРАБОТКА ФОРМЫ ====================

document.querySelector('.answer__form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Собираем имя
    const name = document.getElementById('name').value.trim();

    if (!name) {
        alert('Пожалуйста, введите имя');
        return;
    }

    // Собираем выбранные алкогольные предпочтения
    const alcoholCheckboxes = document.querySelectorAll('.form__item-checkbox .form__checkbox:checked');
    const alcohol = Array.from(alcoholCheckboxes).map(cb => cb.value).join(',');

    // Получаем ответ "да/нет"
    const tomorrow = document.querySelector('input[name="tomorrow"]:checked');
    const tomorrowValue = tomorrow ? tomorrow.value : '';

    // Формируем объект с данными
    const guestData = {
        name: name,
        alcohol: alcohol || 'не указано',
        tomorrow: tomorrowValue || 'не указано',
        date: new Date().toLocaleString('ru-RU')
    };

    // Блокируем кнопку на время отправки
    const submitButton = this.querySelector('.form__button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    try {
        // Сохраняем в CSV на GitHub
        await saveGuestToCSV(guestData);

        alert('Спасибо! Ваши данные сохранены.');
        this.reset();
    } catch (error) {
        alert('Произошла ошибка при сохранении данных. Попробуйте ещё раз.');
        console.error('Ошибка:', error);
    } finally {
        // Возвращаем кнопку в исходное состояние
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});
