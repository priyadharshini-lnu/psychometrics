# Provider: OCI

Ref: https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai-inference/20231130/datatypes/CohereChatRequest

## Basic Chat examples

We need to refresh the model registry to see the newly added models from OCI provider. This step is not really required since the behaviour can be overriden by passing the `assume_model_exists: true` flag while creating the chat instance.
```ruby
# See added models to the provider
RubyLLM.models.refresh!
RubyLLM.models.by_provider(:oci).map(&:id)
```

This is how we create a chat instance using the OCI provider with the `assume_model_exists` flag set to true.
NOTE: This expects that you already have authentication setup for OCI at `Settings.secrets.oci`

```ruby
# Basic chat example
config = OpenStruct.new

config.default_model = 'cohere.command-a' # Required for model registry
config.oci_model_id = 'ocid1.generativeaimodel.oc1.me-riyadh-1.amaaaaaask7dceyareanuup2jo23bfxmcyxzpk2rmsso6ppv4kzzpbtu5fkq'
config.oci_generative_ai_api_base = 'https://inference.generativeai.me-riyadh-1.oci.oraclecloud.com'

context = RubyLLM::Context.new(config)

chat = RubyLLM.chat(provider: :oci, assume_model_exists: true, context: context)
response = chat.ask("Say hi.")
```

### Testing chat with tools
```ruby
# Context configuration
config = OpenStruct.new

config.default_model = 'cohere.command-a'
config.oci_model_id = 'ocid1.generativeaimodel.oc1.me-riyadh-1.amaaaaaask7dceyareanuup2jo23bfxmcyxzpk2rmsso6ppv4kzzpbtu5fkq'
config.oci_generative_ai_api_base = 'https://inference.generativeai.me-riyadh-1.oci.oraclecloud.com'

context = RubyLLM::Context.new(config)

# Tool class
class UserDetails < RubyLLM::Tool
  description "Get the details for the user"
  param :user_id, desc: "ID of the user (e.g., 3)"

  def execute(user_id:)
    {
      name: 'Oliver Smith',
      role: 'Product Manager',
    }
  rescue => e
    { error: e.message }
  end
end

user_details_tool = UserDetails.new


chat = RubyLLM.chat(provider: :oci, context: context, assume_model_exists: true)

chat.with_tool(user_details_tool)

chat.ask("Get the details for user with ID 3.")
```

### Testing with structured output

NOTE: The schema is ignored when tools or documents params are used along with response_format. To pass the schema in such case, pass it as context.

```ruby
config = OpenStruct.new
config.default_model = 'cohere.command-a' # Required for model registry
config.oci_model_id = 'ocid1.generativeaimodel.oc1.me-riyadh-1.amaaaaaask7dceyareanuup2jo23bfxmcyxzpk2rmsso6ppv4kzzpbtu5fkq'
config.oci_generative_ai_api_base = 'https://inference.generativeai.me-riyadh-1.oci.oraclecloud.com'

context = RubyLLM::Context.new(config)

class IDPAIAssistantSchema < RubyLLM::Schema
  string :message, description: "Message by the assistant to be shown to the user"

  array :suggestions, of: :string, description: "Possible suggestion for the user as response to assistant's message, can be empty"

  string :component, enum: ["ChatOutput", "InterviewRequest", "DocumentUpload", "CreateIDP", "SuggestedPlan"], description: "Type of component to be used to display assistant message to user"
end
schema = IDPAIAssistantSchema.new

chat = RubyLLM.chat(provider: :oci, assume_model_exists: true, context: context)
chat.with_instructions("You're an IDP Assistant")
chat = chat.with_schema(IDPAIAssistantSchema)
chat.ask("Hi")
```

## Embedding example

```ruby
config = OpenStruct.new

config.default_embedding_model = 'cohere.embed-v4.0'
config.oci_generative_ai_api_base = 'https://inference.generativeai.me-riyadh-1.oci.oraclecloud.com'
context = RubyLLM::Context.new(config)

embedding_custom = RubyLLM.embed('hello', provider: :oci, assume_model_exists: true, context: context)
```
