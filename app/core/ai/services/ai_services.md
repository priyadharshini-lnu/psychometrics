# OCI OCR

We're using [document understanding OCR service](https://cloud.oracle.com/ai-service/document-understanding/ocr?region=me-riyadh-1) from OCI to extract text from uploaded documents for analysis.

## Notes on storage services with OCR

The oracle OCR service can consumes the document either through oracle object storage or any other public URL.

1. When using oracle object storage, currently we are doing synchronous document analysis which has the limit of 5 pages or 8 MB per document. In future we need to move to asynchronous document analysis to support larger documents.

2. When using blob upload with different storage service like aws s3, we first download the blob and then add that as payload in base64 format to the ocr service. This has the limit of 5 pages or 8 MB per document.

NOTE: The limits for asynchronous document analysis is higher but for synchronous analysis even with OCI bucket, the limit is 5 pages or 8 MB per document.

NOTE: Please ensure that the bucket is created in same region as the authentication region (GENAI_OCI_REGION) to avoid authentication issues.

## Example through blob upload


```ruby
file_path = "tmp/Sample Individual Report.pdf"
filename = file_path.split('/').last

storage_key = "private/temp_documents/#{SecureRandom.uuid}/#{filename}"

blob = ActiveStorage::Blob.create_and_upload!(
  io: File.open(file_path),
  filename: filename,
  service_name: Settings.storage.private_storage_service,
  content_type: "application/pdf",
  key: storage_key
)

# If no language is specified, language classification will be performed along with OCR
AI::Services::OciOcr.call(blob)

AI::Services::OciOcr.call(blob, language: 'en')
```

Example 2: Using language specification for Arabic document

Using image
```ruby
file_path = "tmp/arabic_sample_doc.png"
filename = file_path.split('/').last
storage_key = "private/temp_documents/#{SecureRandom.uuid}/#{filename}"
blob = ActiveStorage::Blob.create_and_upload!(
  io: File.open(file_path),
  filename: filename,
  service_name: Settings.storage.private_storage_service,
  content_type: "image/png",
  key: storage_key
)
AI::Services::OciOcr.call(blob, language: 'ar')
```

# Openai ReponseAPI

Using OpenAI Response API service with RubyLLM chat

### Running with chat record

```ruby
begin
  # use openai model assistant
  openai_provider_assistant = AI::Assistant.find_by(model_id: "gpt-4o", assistant_type: :assistant_tool)

  chat = openai_provider_assistant.for_user(User.find_by(email: 'sritabh@example.com'))
  chat.messages = [] # For testing, clearing previous messages
  chat.ask("Hello", service: :openai_response_api)
rescue RubyLLM::Error => e
  puts "Error: #{e.message} #{e.response.body}"
end
```

### File analysis

```ruby
assistant = AI::Assistant.first
user = User.first

chat = assistant.for_user(user)

begin
  response = chat.with_params().ask('Please analyze this document', with: 'https://pdfobject.com/pdf/sample.pdf', service: :openai_response_api)
  puts response.content
  puts "Input tokens:  #{response.input_tokens}"
  puts "Output tokens: #{response.output_tokens}"
rescue => e
  puts "Unexpected error: #{e.class} - #{e.message}"
end
```
