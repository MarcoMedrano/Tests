onmessage = function (event) {
  var context = new CanvasRenderingContext2D();
  event.data.setContext(context); // event.data is the CanvasProxy object
  setInterval(function () {
    context.clearRect(0, 0, context.width, context.height);
    context.fillText(new Date(), 0, 100);
    context.commit();
  }, 1000);
};