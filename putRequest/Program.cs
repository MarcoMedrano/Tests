using System.Net.Http;
using System.Net.Http.Headers;

var filePath = @"/Users/marco/Pictures/me.jpeg";

using var multipartFormContent = new MultipartFormDataContent();
var fileStreamContent = new StreamContent(File.OpenRead(filePath));
fileStreamContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");

//Add the file
multipartFormContent.Add(fileStreamContent, name: "file", fileName: "house.png");

//Send it
var response = await new HttpClient().PostAsync(
    "https://s3.sa-east-1.amazonaws.com/markind-facs/-dev/media-resources/test.jpg?X-Amz-Expires=3600&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAS3XZOLS52OSQQY5A/20220707/sa-east-1/s3/aws4_request&X-Amz-Date=20220707T210528Z&X-Amz-SignedHeaders=host&X-Amz-Signature=2acb13b87a9ad1c28a621d9fadbd51f63259c51b6dbb476cc9adfb06f114e7a8"
    , multipartFormContent);

response.EnsureSuccessStatusCode();
var res = await response.Content.ReadAsStringAsync();

Console.WriteLine("done! \n" + res);
