import { FileCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function CodeBlock({ children, language = 'bash' }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className={`bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm font-mono language-${language}`}>
        <code>{children.trim()}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded bg-slate-700 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-slate-300" />}
      </button>
    </div>
  );
}

function ApiDocsPage() {
  const baseUrl = window.location.origin + '/api';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileCode className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">ATC Booking System REST API</p>
        </div>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock>{baseUrl}</CodeBlock>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>The API supports two authentication levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Level</th>
                  <th className="text-left py-2 pr-4 font-medium">Method</th>
                  <th className="text-left py-2 font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-medium text-green-600 dark:text-green-400">Public</td>
                  <td className="py-2 pr-4 text-muted-foreground">None</td>
                  <td className="py-2">Read-only access to bookings</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-blue-600 dark:text-blue-400">Organization</td>
                  <td className="py-2 pr-4 text-muted-foreground">Bearer Token</td>
                  <td className="py-2">Full CRUD on own organization's bookings</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-medium mb-2">Organization Authentication (Bearer Token)</h4>
            <p className="text-sm text-muted-foreground mb-2">Include your API key in the Authorization header:</p>
            <CodeBlock>Authorization: Bearer YOUR_API_KEY</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card>
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>All responses follow this structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Success Response</h4>
            <CodeBlock language="json">{`{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">Error Response</h4>
            <CodeBlock language="json">{`{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error messages"]
  }
}`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">HTTP Status Codes</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div><span className="font-mono text-green-600">200</span> Success</div>
              <div><span className="font-mono text-green-600">201</span> Created</div>
              <div><span className="font-mono text-green-600">204</span> No Content</div>
              <div><span className="font-mono text-yellow-600">400</span> Bad Request</div>
              <div><span className="font-mono text-yellow-600">401</span> Unauthorized</div>
              <div><span className="font-mono text-yellow-600">404</span> Not Found</div>
              <div><span className="font-mono text-yellow-600">422</span> Validation Error</div>
              <div><span className="font-mono text-red-600">500</span> Server Error</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">PUBLIC</span>
            List Bookings
          </CardTitle>
          <CardDescription>Retrieve all bookings with optional filters. No authentication required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600">GET</span>
            <code className="text-sm font-mono">/bookings</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Query Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                    <th className="text-left py-2 pr-4 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">callsign</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by callsign (partial match)</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">division</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by division (e.g., "VATUSA")</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">subdivision</td><td className="py-2 pr-4">string</td><td className="py-2">Filter by subdivision (e.g., "ZLA")</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">type</td><td className="py-2 pr-4">string</td><td className="py-2">booking, event, exam, training</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">startDate</td><td className="py-2 pr-4">ISO 8601</td><td className="py-2">Bookings starting after this date</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">endDate</td><td className="py-2 pr-4">ISO 8601</td><td className="py-2">Bookings ending before this date</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-foreground">order</td><td className="py-2 pr-4">string</td><td className="py-2">current, past, or future</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <CodeBlock>{`curl "${baseUrl}/bookings?division=VATUSA&order=current"`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Response</h4>
            <CodeBlock language="json">{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "cid": "1234567",
      "callsign": "KLAX_TWR",
      "type": "booking",
      "start": "2024-01-15T14:00:00.000Z",
      "end": "2024-01-15T16:00:00.000Z",
      "division": "VATUSA",
      "subdivision": "ZLA",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}`}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* Organization Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">ORG</span>
            Create Booking
          </CardTitle>
          <CardDescription>Create a new booking. Requires organization API key.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600">POST</span>
            <code className="text-sm font-mono">/bookings</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Request Body</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Field</th>
                    <th className="text-left py-2 pr-4 font-medium">Type</th>
                    <th className="text-left py-2 pr-4 font-medium">Required</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">cid</td><td className="py-2 pr-4">string</td><td className="py-2 pr-4">Yes</td><td className="py-2">Controller's VATSIM CID</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">callsign</td><td className="py-2 pr-4">string</td><td className="py-2 pr-4">Yes</td><td className="py-2">Position callsign (valid suffix required)</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">type</td><td className="py-2 pr-4">string</td><td className="py-2 pr-4">No</td><td className="py-2">booking (default), event, exam, training</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">start</td><td className="py-2 pr-4">ISO 8601</td><td className="py-2 pr-4">Yes</td><td className="py-2">Booking start time</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">end</td><td className="py-2 pr-4">ISO 8601</td><td className="py-2 pr-4">Yes</td><td className="py-2">Booking end time</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-mono text-foreground">division</td><td className="py-2 pr-4">string</td><td className="py-2 pr-4">Yes</td><td className="py-2">Division code (e.g., "VATUSA")</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-foreground">subdivision</td><td className="py-2 pr-4">string</td><td className="py-2 pr-4">No</td><td className="py-2">Subdivision code (e.g., "ZLA")</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Valid Callsign Suffixes</h4>
            <div className="flex flex-wrap gap-2">
              {['_DEL', '_GND', '_TWR', '_APP', '_DEP', '_CTR', '_FSS'].map((suffix) => (
                <span key={suffix} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-sm">{suffix}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <CodeBlock>{`curl -X POST "${baseUrl}/bookings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cid": "1234567",
    "callsign": "KLAX_TWR",
    "type": "booking",
    "start": "2024-01-15T14:00:00.000Z",
    "end": "2024-01-15T16:00:00.000Z",
    "division": "VATUSA",
    "subdivision": "ZLA"
  }'`}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* Update Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">ORG</span>
            Update Booking
          </CardTitle>
          <CardDescription>Update a booking owned by your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-600">PUT</span>
            <code className="text-sm font-mono">/bookings/:id</code>
          </div>

          <p className="text-sm text-muted-foreground">All fields are optional. Only include fields you want to update.</p>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <CodeBlock>{`curl -X PUT "${baseUrl}/bookings/1" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "end": "2024-01-15T18:00:00.000Z"
  }'`}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* Delete Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">ORG</span>
            Delete Booking
          </CardTitle>
          <CardDescription>Delete a booking owned by your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-600">DELETE</span>
            <code className="text-sm font-mono">/bookings/:id</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <CodeBlock>{`curl -X DELETE "${baseUrl}/bookings/1" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</CodeBlock>
          </div>

          <p className="text-sm text-muted-foreground">Returns <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">204 No Content</code> on success.</p>
        </CardContent>
      </Card>

      {/* Get My Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">ORG</span>
            Get My Organization
          </CardTitle>
          <CardDescription>Get information about your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600">GET</span>
            <code className="text-sm font-mono">/org/me</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Response</h4>
            <CodeBlock language="json">{`{
  "success": true,
  "data": {
    "id": 1,
    "name": "Los Angeles ARTCC",
    "division": "VATUSA",
    "subdivision": "ZLA",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`}</CodeBlock>
          </div>
        </CardContent>
      </Card>

      {/* Get My Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">ORG</span>
            Get My Bookings
          </CardTitle>
          <CardDescription>Get all bookings for your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-600">GET</span>
            <code className="text-sm font-mono">/org/bookings</code>
          </div>
        </CardContent>
      </Card>

      {/* Booking Types */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <div className="font-medium">booking</div>
                <div className="text-sm text-muted-foreground">Standard ATC booking</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="font-medium">event</div>
                <div className="text-sm text-muted-foreground">Special event coverage</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <div className="font-medium">exam</div>
                <div className="text-sm text-muted-foreground">Controller examination</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div>
                <div className="font-medium">training</div>
                <div className="text-sm text-muted-foreground">Training session</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Common Errors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Validation Error (422)</h4>
            <CodeBlock language="json">{`{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "callsign": ["Callsign must end with: _DEL, _GND, _TWR, _APP, _DEP, _CTR, or _FSS"]
  }
}`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">Unauthorized (401)</h4>
            <CodeBlock language="json">{`{
  "success": false,
  "message": "Invalid or missing API key"
}`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">Wrong Organization (400)</h4>
            <CodeBlock language="json">{`{
  "success": false,
  "message": "You can only modify bookings from your own organization"
}`}</CodeBlock>
          </div>

          <div>
            <h4 className="font-medium mb-2">Overlap Error (400)</h4>
            <CodeBlock language="json">{`{
  "success": false,
  "message": "Booking overlaps with existing booking for this callsign"
}`}</CodeBlock>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApiDocsPage;
