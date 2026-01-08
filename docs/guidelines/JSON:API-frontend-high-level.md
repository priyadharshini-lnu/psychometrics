## What's it intended for?
This API allows engineers to hide [low level](https://github.com/TheTalentEnterprise/psychometrics/wiki/JSON:API-frontend-low-level) API


## High-Level Picture
![image](https://user-images.githubusercontent.com/10116909/230647617-78eeb55e-6847-4f5d-9fb9-09a3ebaa37f7.png)

```
<Resource config={config} name="users">
  <Resource.Filter placeholder="Search" name="filterable_fields" />
  <Resource.Table pagination>
    <Resource.Column<User> title="ID" id="id" width={300} sorter />
    <Resource.Column<User> title="First Name" id="first_name" width={300} sorter />
  </Resource.Table>
</Resource>
```

## The `Resource` Component
Props
1. name (string, required). See `ResourceName` [here](https://github.com/TheTalentEnterprise/psychometrics/wiki/JSON:API-frontend-low-level#arguments-of-useresource-hook)
2. config (object, required). See `Options` [here](https://github.com/TheTalentEnterprise/psychometrics/wiki/JSON:API-frontend-low-level#arguments-of-useresource-hook)

The `Resource` component builds a `resource` context and allows all children to retrieve that by the following command `const { resource } = useResourceContext()`. More details about the `resource` object are [here](https://github.com/TheTalentEnterprise/psychometrics/wiki/JSON:API-frontend-low-level#data-returned-by-useresources-hook)

## The `Resource.Filter` Component
Actually, this component is a top layer, that contains `Filter` input, total records, and any extra data, that is necessary. Would be nice to revisit naming later

Props
1. placeholder (string, optional). An HTML placeholder of search input
2. name (string, required). A name of a ransack scope, that will be used for the search

## The `Resource.Table` Component
That's a wrapper above Ant Table Component.

Props
1. pagination (boolean, optional). When it's `false`, we don't render the pagination

The Table component contains `Resource.Column`

## The `Resource.Column` Component
That's a wrapper above Ant `Table.Column` Component.

Props
1. id (string, required). The name of the column
2. title (string, required). The title of the column
3. sorter (boolean, optional). When it's true, the column acquires sorting behavior
4. render ((record) => React.FC, optional). By default, the component just renders a value from the record. But it can be overridden by a component, that you can pass through the `render` prop. 


