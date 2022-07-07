using System.Net.Http;
using System.Net.Http.Headers;

var filePath = @"/Users/marco/Pictures/happySF.jpeg";

using var multipartFormContent = new MultipartFormDataContent();
var fileStreamContent = new StreamContent(File.OpenRead(filePath));
fileStreamContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");

//Add the file
multipartFormContent.Add(fileStreamContent, name: "file", fileName: "house.png");

//Send it
var response = await new HttpClient().PostAsync(
    "https://markind-facs.s3.sa-east-1.amazonaws.com/facs/-dev/media-resources/test.jpg?X-Amz-Expires=3600&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAS3XZOLS52OSQQY5A/20220707/sa-east-1/s3/aws4_request&X-Amz-Date=20220707T205332Z&X-Amz-SignedHeaders=host&X-Amz-Signature=f81c50abaa136b9736e34a468122bf6f46e0c5243fed8509eafc589ce5c0e4b4"
    , multipartFormContent);
response.EnsureSuccessStatusCode();
var res = await response.Content.ReadAsStringAsync();

Console.WriteLine("done! \n" + res);
