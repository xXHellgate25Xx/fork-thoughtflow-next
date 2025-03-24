// Script to generate TypeScript interfaces from Airtable tables using the metadata API
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.replace(/\\n/g, '\n');
          value = value.substring(1, value.length - 1);
        }
        
        process.env[key] = value;
      }
    });
    
    console.log('Environment variables loaded from .env file');
  }
} catch (error) {
  console.warn('Could not load .env file:', error.message);
}

// Get command line arguments or use environment variables
const args = process.argv.slice(2);
const baseId = args[0] || process.env.VITE_AIRTABLE_BASE_ID;
const apiKey = args[1] || process.env.VITE_AIRTABLE_API_KEY;

if (!baseId || !apiKey) {
  console.error('Error: Please provide Airtable Base ID and API Key');
  console.error('Usage: node generateAirtableInterfaces.mjs <baseId> <apiKey>');
  console.error('Or set VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_KEY in .env file');
  process.exit(1);
}

// Type mapping from Airtable types to TypeScript types
const typeMapping = {
  'singleLineText': 'string',
  'multilineText': 'string',
  'richText': 'string',
  'number': 'number',
  'integer': 'number',
  'decimal': 'number',
  'checkbox': 'boolean',
  'singleSelect': 'string',
  'multipleSelect': 'string[]',
  'date': 'string', // ISO date string
  'dateTime': 'string', // ISO datetime string
  'attachment': 'Array<{ url: string; filename: string; size: number; type: string; }>',
  'multipleAttachments': 'Array<{ url: string; filename: string; size: number; type: string; }>',
  'url': 'string',
  'email': 'string',
  'phone': 'string',
  'currency': 'number',
  'percent': 'number',
  'duration': 'number',
  'rating': 'number',
  'formula': 'any', // Depends on formula output type
  'rollup': 'any', // Depends on rollup type
  'count': 'number',
  'lookup': 'any', // Depends on looked-up field type
  'foreignKey': 'string', // Record ID reference
  'multipleForeignKeys': 'string[]', // Array of Record IDs
  'autoNumber': 'number',
  'barcode': 'string',
  'button': 'any',
  'createdBy': 'string',
  'createdTime': 'string',
  'lastModifiedBy': 'string',
  'lastModifiedTime': 'string',
};

// Function to make a request to the Airtable API
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(new Error(`Error parsing response: ${error.message}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${response.statusCode}: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to get table metadata
async function getTableMetadata() {
  try {
    console.log('Fetching tables from Airtable metadata API...');
    
    // Fetch tables metadata using the API
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    console.log(`API URL: ${url}`);
    
    const response = await makeRequest(url);
    
    if (!response.tables || !Array.isArray(response.tables)) {
      throw new Error('Invalid response from Airtable API: missing tables array');
    }
    
    console.log(`Found ${response.tables.length} tables`);
    return response.tables;
  } catch (error) {
    console.error('Error fetching table metadata:', error.message);
    throw error;
  }
}

// Function to generate enum type for select fields
function generateEnumType(field) {
  if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
    return 'string';
  }
  
  const enumValues = field.options.map(opt => 
    `'${opt.name.replace(/'/g, "\\'")}'`
  ).join(' | ');
  
  return enumValues;
}

// Function to get TypeScript type for a field
function getTypeForField(field) {
  // Map Airtable field type to TypeScript type
  let baseType = typeMapping[field.type] || 'any';
  
  // Handle select fields with options as union types
  if (field.type === 'singleSelect' && field.options && field.options.length > 0) {
    baseType = generateEnumType(field);
  } else if (field.type === 'multipleSelect' && field.options && field.options.length > 0) {
    // For multiple select, we could make a union of arrays but that gets complex
    // so we'll just use string[] for simplicity
    baseType = 'string[]';
  }
  
  return baseType;
}

// Function to sanitize table name for TypeScript interface name
function sanitizeTableName(name) {
  // Replace any non-alphanumeric characters with underscores
  // This handles special characters like [, ], -, spaces, etc.
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

// Function to generate interface for a table
function generateInterface(table) {
  if (!table.fields || !Array.isArray(table.fields)) {
    return `export interface ${sanitizeTableName(table.name)}Record {
  id: string;
  createdTime: string;
  lastModifiedTime: string;
}\n`;
  }
  
  const fields = table.fields.map(field => {
    const typeAnnotation = getTypeForField(field);
    return `  '${field.name}': ${typeAnnotation};`;
  }).join('\n');
  
  return `export interface ${sanitizeTableName(table.name)}Record {
  id: string;
${fields}
  createdTime: string;
  lastModifiedTime: string;
}\n`;
}

// Function to generate base utility types
function generateBaseTypes() {
  return `// Base interface for filter conditions
export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'notContains';
  value: any;
}

// Base interface for sort conditions
export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

// Base interface for query options
export interface QueryOptions {
  tableId: string;
  filters?: FilterCondition[];
  sort?: SortCondition[];
  limit?: number;
  offset?: number;
}

// Base interface for Airtable records
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

// Base interface for table fields
export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: { name: string; id: string; }[];
}

// Base interface for table metadata
export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
}\n`;
}

// Main function to generate types
async function generateTypes() {
  try {
    console.log('Fetching Airtable metadata...');
    console.log(`Using Base ID: ${baseId}`);
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);
    
    const tables = await getTableMetadata();
    
    console.log(`Found ${tables.length} tables.`);
    
    let output = '// Generated Airtable Types\n// This file is auto-generated. Do not edit directly.\n\n';
    
    // Add base types
    output += generateBaseTypes() + '\n';
    
    // Add table interfaces
    tables.forEach(table => {
      console.log(`Generating interface for table: ${table.name}`);
      output += generateInterface(table) + '\n';
    });

    // Generate a type for all table names
    // Using sanitized names to avoid invalid TypeScript
    const tableNames = tables.map(table => `'${sanitizeTableName(table.name)}'`).join(' | ');
    output += `export type AirtableTableName = ${tableNames};\n`;

    // Create the output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'types');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the generated types to a file
    const outputPath = path.join(outputDir, 'airtableTypes.ts');
    fs.writeFileSync(outputPath, output);

    console.log(`✅ Successfully generated Airtable types at ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating types:', error.message);
    process.exit(1);
  }
}

// Execute the script
generateTypes(); 