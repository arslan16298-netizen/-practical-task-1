// Минимальная логика для HTML/CSS-проекта:
// 1) открытие и закрытие модальных окон <dialog>;
// 2) проверка форм с понятными сообщениями об ошибках;
// 3) «Наверх» без смены якоря;
// 4) подстановка товара и категории из адресной строки.
// Без JavaScript сайт тоже работает: фильтры, FAQ и страница товара сделаны на CSS.

// ---------- 1. Модальные окна ----------

// Кнопка с data-dialog-open="id" открывает окно с этим id.
document.querySelectorAll('[data-dialog-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialogOpen);

    if (dialog) {
      dialog.showModal();
    }
  });
});

// Закрытие по кнопке с data-dialog-close и по клику на затемнённый фон.
// Закрытие по Escape у <dialog> встроено в браузер.
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    const isCloseButton = event.target.closest('[data-dialog-close]');
    const isBackdrop = event.target === dialog;

    if (isCloseButton || isBackdrop) {
      dialog.close();
    }
  });
});

// ---------- 2. Проверка форм ----------

// Текст ошибки для поля по результату встроенной проверки браузера (validity).
function getErrorMessage(field) {
  const { validity } = field;

  if (validity.valid) {
    return '';
  }

  if (validity.valueMissing) {
    if (field.type === 'checkbox') {
      return 'Без согласия мы не сможем связаться с вами.';
    }

    return field.tagName === 'SELECT' ? 'Выберите вариант из списка.' : 'Заполните это поле.';
  }

  if (validity.typeMismatch && field.type === 'email') {
    return 'Проверьте адрес: он должен выглядеть как name@mail.ru.';
  }

  if (validity.patternMismatch) {
    return field.dataset.patternMessage || 'Проверьте формат.';
  }

  if (validity.tooShort) {
    return `Минимум ${field.minLength} символа.`;
  }

  if (validity.rangeUnderflow || validity.rangeOverflow) {
    return `Укажите число от ${field.min} до ${field.max}.`;
  }

  return 'Проверьте значение поля.';
}

// Показывает или убирает ошибку под полем.
function updateFieldError(field) {
  const message = getErrorMessage(field);
  const errorElement = document.getElementById(`${field.id}-error`);

  if (message) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }

  if (errorElement) {
    errorElement.textContent = message;
  }

  return message === '';
}

document.querySelectorAll('form[data-validate]').forEach((form) => {
  // Отключаем всплывающие подсказки браузера: ошибки выводим под полями.
  // Если JavaScript не загрузится, сработает обычная HTML-проверка.
  form.noValidate = true;

  const fields = Array.from(form.elements).filter((element) => element.willValidate && element.id);

  fields.forEach((field) => {
    // Проверяем поле, когда пользователь из него вышел...
    field.addEventListener('blur', () => updateFieldError(field));

    // ...и сразу убираем ошибку, как только значение исправлено.
    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        updateFieldError(field);
      }
    });
  });

  form.addEventListener('reset', () => {
    fields.forEach((field) => {
      field.removeAttribute('aria-invalid');
      const errorElement = document.getElementById(`${field.id}-error`);

      if (errorElement) {
        errorElement.textContent = '';
      }
    });
  });

  form.addEventListener('submit', (event) => {
    // Сервера у учебного проекта нет, поэтому данные никуда не отправляются.
    event.preventDefault();

    const results = fields.map(updateFieldError);
    const firstInvalidIndex = results.indexOf(false);

    if (firstInvalidIndex !== -1) {
      fields[firstInvalidIndex].focus();
      return;
    }

    form.reset();

    const parentDialog = form.closest('dialog');

    if (parentDialog) {
      parentDialog.close();
    }

    const successDialog = document.getElementById(form.dataset.success);

    if (successDialog) {
      successDialog.showModal();
    }
  });
});

// ---------- 3. «Наверх» и «Перейти к содержимому» без смены якоря ----------

// На product.html товар выбирается якорем (#sona-h7). Если ссылка «Наверх»
// заменит якорь на #top, страница переключится на товар по умолчанию.
// Поэтому прокручиваем страницу сами и не трогаем адрес.
const toTopLink = document.querySelector('.to-top');

if (toTopLink) {
  toTopLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0 });
    document.querySelector('.site-header__logo').focus({ preventScroll: true });
  });
}

const skipLink = document.querySelector('.skip-link');
const mainContent = document.getElementById('main');

if (skipLink && mainContent) {
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
  });
}

// ---------- 4. Параметры из адресной строки ----------

const params = new URLSearchParams(window.location.search);

// order.html?product=sona-h7 — выбираем товар в форме заказа.
const productSelect = document.getElementById('order-product');
const productFromUrl = params.get('product');

if (productSelect && productFromUrl) {
  const option = Array.from(productSelect.options).find((item) => item.value === productFromUrl);

  if (option) {
    productSelect.value = productFromUrl;
  }
}

// catalog.html?category=audio — отмечаем категорию в фильтре.
// Сама фильтрация карточек выполняется в CSS через :has().
const categoryFromUrl = params.get('category');

if (categoryFromUrl) {
  const categoryInput = document.getElementById(`filter-${categoryFromUrl}`);

  if (categoryInput && categoryInput.name === 'category') {
    categoryInput.checked = true;
  }
}
