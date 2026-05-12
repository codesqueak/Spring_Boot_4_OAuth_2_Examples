import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { toDMS } from "../utils/coords";

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export interface CaptureDto {
  uuid: string;
  vrm: string;
  captureDateTime: string;
  confidence?: number;
  preset?: string;
  location?: { lat?: string; lng?: string };
  source?: { country?: number; organisation?: number; platform?: number; sensor?: number };
}

interface CaptureResultsTableProps {
  results: CaptureDto[] | null;
  error: string | null;
}

export default function CaptureResultsTable({ results, error }: CaptureResultsTableProps) {
  const [sortAsc, setSortAsc] = useState(true);
  const [orgNameMap, setOrgNameMap] = useState<Map<string, string>>(new Map());
  const [platformNameMap, setPlatformNameMap] = useState<Map<string, string>>(new Map());
  const [sensorNameMap, setSensorNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setOrgNameMap(new Map());
    setPlatformNameMap(new Map());
    setSensorNameMap(new Map());
    if (!results || results.length === 0) return;

    const orgIds = [...new Set(results.map((r) => r.source?.organisation).filter((v): v is number => v != null))];
    const platformPairs = [...new Map(
      results
        .filter((r) => r.source?.organisation != null && r.source?.platform != null)
        .map((r) => [`${r.source!.organisation}-${r.source!.platform}`, { organisation: r.source!.organisation!, platform: r.source!.platform! }])
    ).values()];
    const sensorTriples = [...new Map(
      results
        .filter((r) => r.source?.organisation != null && r.source?.platform != null && r.source?.sensor != null)
        .map((r) => [`${r.source!.organisation}-${r.source!.platform}-${r.source!.sensor}`, { organisation: r.source!.organisation!, platform: r.source!.platform!, sensor: r.source!.sensor! }])
    ).values()];

    if (orgIds.length === 0) return;

    const fetchNames = async () => {
      try {
        const orgArg = `[${orgIds.join(", ")}]`;
        const platformArg = `[${platformPairs.map((p) => `{ organisation: ${p.organisation}, platform: ${p.platform} }`).join(", ")}]`;
        const sensorArg = `[${sensorTriples.map((s) => `{ organisation: ${s.organisation}, platform: ${s.platform}, sensor: ${s.sensor} }`).join(", ")}]`;
        const gql = `query { sensorNames(organisation: ${orgArg}, platform: ${platformArg}, sensor: ${sensorArg}) { organisation { id name } platform { organisation platform name } sensor { organisation platform sensor name } } }`;
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-correlation-id": crypto.randomUUID() },
          body: JSON.stringify({ query: gql }),
        });
        const json = await response.json();
        if (json.errors) return;
        const data = json.data?.sensorNames;
        if (!data) return;
        setOrgNameMap(new Map(data.organisation.map((o: { id: number | string; name: string }) => [String(o.id), o.name])));
        setPlatformNameMap(new Map(data.platform.map((p: { organisation: number | string; platform: number | string; name: string }) => [`${p.organisation}-${p.platform}`, p.name])));
        setSensorNameMap(new Map(data.sensor.map((s: { organisation: number | string; platform: number | string; sensor: number | string; name: string }) => [`${s.organisation}-${s.platform}-${s.sensor}`, s.name])));
      } catch {
        // leave integer values showing if lookup fails
      }
    };
    fetchNames();
  }, [results]);

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {results !== null && (
        <Stack spacing={1}>
          <Box sx={{ mt: 1 }} />
          <Typography variant="body2">{results.length} result(s) returned</Typography>
          <Box sx={{ mt: 1 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Registration</TableCell>
                  <TableCell sortDirection={sortAsc ? "asc" : "desc"}>
                    <TableSortLabel
                      active
                      direction={sortAsc ? "asc" : "desc"}
                      onClick={() => setSortAsc((prev) => !prev)}
                    >
                      Captured At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Lat / Lng</TableCell>
                  <TableCell>Organisation</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Sensor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...results].sort((a, b) => {
                  const diff = new Date(a.captureDateTime ?? "").getTime() - new Date(b.captureDateTime ?? "").getTime();
                  return sortAsc ? diff : -diff;
                }).map((row) => (
                  <TableRow key={row.uuid}>
                    <TableCell>{row.vrm ?? ""}</TableCell>
                    <TableCell>{row.captureDateTime ? new Date(row.captureDateTime).toLocaleString(undefined, { hour12: false }) : ""}</TableCell>
                    <TableCell>{[toDMS(row.location?.lat), toDMS(row.location?.lng)].filter(Boolean).join(" / ")}</TableCell>
                    <TableCell>{row.source?.organisation != null ? (orgNameMap.get(String(row.source.organisation)) ?? row.source.organisation) : ""}</TableCell>
                    <TableCell>{row.source?.organisation != null && row.source?.platform != null ? (platformNameMap.get(`${row.source.organisation}-${row.source.platform}`) ?? row.source.platform) : ""}</TableCell>
                    <TableCell>{row.source?.organisation != null && row.source?.platform != null && row.source?.sensor != null ? (sensorNameMap.get(`${row.source.organisation}-${row.source.platform}-${row.source.sensor}`) ?? row.source.sensor) : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </>
  );
}
