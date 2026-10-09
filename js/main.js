// Минимальная логика модальных окон <dialog>.
// Всё остальное (фильтры, FAQ, выбор товара, проверка форм) сделано на HTML и CSS.

// Кнопка с data-dialog-open="id" открывает окно с этим id.
document.querySelectorAll('[data-dialog-open]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.dialogOpen).showModal();
  });
});

// Закрытие по кнопке с data-dialog-close и по клику на затемнённый фон.
// Закрытие по Escape у <dialog> встроено в браузер.
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-dialog-close]') || event.target === dialog) {
      dialog.close();
    }
  });
});

// Форма с data-success="id": после встроенной проверки браузера
// закрываем окно с формой и открываем окно с подтверждением.
// Сервера у учебного проекта нет, поэтому данные никуда не отправляются.
document.querySelectorAll('form[data-success]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    form.closest('dialog')?.close();
    document.getElementById(form.dataset.success).showModal();
  });
});
