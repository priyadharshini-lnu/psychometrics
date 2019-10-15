$(function() {
  $(document).on("click", ".copy-coded-url", function() {
    var url = $(this).attr("data-title");
    Utils.copyToClipboard(url);
    noty({ text: "URL is copied to clipboard successfully", type: "success" });
  });
});
