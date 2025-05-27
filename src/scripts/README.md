# Airtable TypeScript Interface Generator

This script automatically generates TypeScript interfaces from your Airtable tables schema using the official Airtable Metadata API.

## Usage

1. Create a `.env` file in the root of your project (copy from `.env.example`):

   ```
   NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
   ```

2. Run the generator:

   ```bash
   npm run generate:airtable-types
   ```

3. Alternatively, you can pass the Base ID and API Key directly:
   ```bash
   npm run generate:airtable-types -- your_base_id your_api_key
   ```

## How It Works

The script:

1. Connects to the Airtable Metadata API using the provided API key and base ID
2. Fetches complete schema information using the endpoint: `https://api.airtable.com/v0/meta/bases/{baseId}/tables`
3. Processes the response to extract tables, fields, and options
4. Generates TypeScript interfaces based on the accurate schema information
5. Creates a `src/types/mapAirtableTypes.ts` file with the generated interfaces

## Generated Types

The script generates:

1. Base utility interfaces:

   - `FilterCondition`
   - `SortCondition`
   - `QueryOptions`
   - `AirtableRecord`
   - `AirtableField`
   - `AirtableTable`

2. Table-specific interfaces based on your actual Airtable structure:

   ```typescript
   export interface TasksRecord {
     id: string;
     Title: string;
     Description: string;
     Status: 'To Do' | 'In Progress' | 'Done'; // Actual enum values from your table
     // ...other fields with accurate types
     createdTime: string;
     lastModifiedTime: string;
   }
   ```

3. A union type of all table names:
   ```typescript
   export type AirtableTableName = 'Tasks' | 'Projects' | 'Contacts';
   ```

## Advantages of Using the Metadata API

Using the official Metadata API provides several benefits:

1. **Complete Schema Information**: Gets the full table and field definitions directly from Airtable
2. **Accurate Field Types**: No need to infer types from sample data
3. **Full Enum Options**: Gets all possible values for select fields, not just those present in sample records
4. **API Key Permission**: Only requires an API key with schema access permissions
5. **No Data Access Required**: Doesn't need to read any actual records from your tables

## Type Mapping

The script maps Airtable field types to TypeScript types:

| Airtable Type    | TypeScript Type                                        |
| ---------------- | ------------------------------------------------------ |
| Single Line Text | `string`                                               |
| Long Text        | `string`                                               |
| Number           | `number`                                               |
| Checkbox         | `boolean`                                              |
| Single Select    | Union type of options (e.g., `'Option1' \| 'Option2'`) |
| Multiple Select  | `string[]`                                             |
| Date             | `string` (ISO format)                                  |
| Attachments      | `Array<{ url: string; filename: string; ... }>`        |
| ...and more      | See full mapping in the script                         |

## Requirements

For this script to work, your Airtable API key must have schema access permissions to the base.

## Notes

If you encounter any errors related to the API response, check that:

1. Your API key is valid and has the correct permissions
2. The base ID is correct
3. Your API key can access the metadata API

## Type Inference

The script tries to infer appropriate TypeScript types for your Airtable fields:

| Airtable Type    | TypeScript Type                                        |
| ---------------- | ------------------------------------------------------ |
| Single Line Text | `string`                                               |
| Long Text        | `string`                                               |
| Number           | `number`                                               |
| Checkbox         | `boolean`                                              |
| Single Select    | Union type of options (e.g., `'Option1' \| 'Option2'`) |
| Multiple Select  | `string[]`                                             |
| Date             | `string` (ISO format)                                  |
| Attachments      | `Array<{ url: string; filename: string; ... }>`        |
| ...and more      | See full mapping in the script                         |

## Limitations

1. Type inference is based on sample data, so it may not be 100% accurate for all fields
2. Select field options are limited to values present in the sample record
3. Empty tables or tables with no records cannot be properly typed
4. Formula and rollup fields are typed as `any`

## Setup

1. Install the required dependencies:

   ```bash
   npm install ts-node --save-dev
   ```

2. The script is already configured in package.json with:
   ```json
   {
     "scripts": {
       "generate:airtable-types": "npx ts-node src/scripts/generateAirtableTypes.ts"
     }
   }
   ```

## Maintenance

The types are automatically generated and should not be edited manually. If you need to update the types:

1. Make changes to your Airtable table structure
2. Run the generator script:
   ```bash
   npm run generate:airtable-types
   ```
3. The types will be automatically updated

Note: The script requires an active connection to your Airtable base and proper authentication.
