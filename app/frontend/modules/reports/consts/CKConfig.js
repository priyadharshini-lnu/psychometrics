
export default {
  removePlugins: 'elementspath',
  width: '100%',
  resize_enabled: false,
  // enterMode: CKEDITOR.ENTER_BR, // This causes BidiLtr, BidiRtl to be disabled
  language: 'en',
  startupFocus: true,
  toolbar: [
    { name: 'insert', items: ['Image', 'SpecialChar', 'Link', 'Unlink'] },
    { name: 'clipboard', items: ['Undo', 'Redo'] },
    {
      name: 'editing',
      items: [
        'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'Outdent', 'Indent', 'NumberedList', 'BulletedList',
      ],
    },
    { name: 'forms', items: ['Source'] },
    { name: 'format', items: ['RemoveFormat'] },
    { name: 'styles', items: ['Font', 'FontSize'] },
    { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', '-'] },
    { name: 'colors', items: ['TextColor', 'BGColor'] },
    { name: 'direction', items: ['BidiLtr', 'BidiRtl'] },
  ],
}
