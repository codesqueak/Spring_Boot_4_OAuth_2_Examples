import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface SearchBarProps {
  startDate: Dayjs;
  endDate: Dayjs;
  vehicleRegistration: string;
  loading: boolean;
  onStartDateChange: (val: Dayjs) => void;
  onEndDateChange: (val: Dayjs) => void;
  onVehicleRegistrationChange: (val: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

export default function SearchBar({
  startDate,
  endDate,
  vehicleRegistration,
  loading,
  onStartDateChange,
  onEndDateChange,
  onVehicleRegistrationChange,
  onReset,
  onSearch,
}: SearchBarProps) {
  const dateRangeInvalid = startDate.isAfter(endDate) || startDate.isSame(endDate);

  const applyRange = (label: string) => {
    const now = dayjs();
    if (label === "Today") {
      onStartDateChange(now.startOf("day"));
      onEndDateChange(now.endOf("day"));
    } else if (label === "12 Hours") {
      onStartDateChange(now.subtract(12, "hour"));
      onEndDateChange(now);
    } else if (label === "24 Hours") {
      onStartDateChange(now.subtract(24, "hour"));
      onEndDateChange(now);
    } else if (label === "7 Days") {
      onStartDateChange(now.subtract(7, "day"));
      onEndDateChange(now);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <DateTimePicker
          label="Start Date"
          value={startDate}
          onChange={(val) => val && onStartDateChange(val)}
          ampm={false}
          slotProps={{
            textField: {
              error: dateRangeInvalid,
              helperText: dateRangeInvalid ? "Must be before end date" : "",
            },
          }}
          sx={{ width: 220 }}
        />
        <DateTimePicker
          label="End Date"
          value={endDate}
          onChange={(val) => val && onEndDateChange(val)}
          ampm={false}
          slotProps={{
            textField: {
              error: dateRangeInvalid,
              helperText: dateRangeInvalid ? "Must be after start date" : "",
            },
          }}
          sx={{ width: 220 }}
        />
        <TextField
          label="Vehicle Registration"
          value={vehicleRegistration}
          onChange={(e) => onVehicleRegistrationChange(e.target.value.toUpperCase())}
          slotProps={{ htmlInput: { minLength: 1, maxLength: 25 } }}
          error={vehicleRegistration.length < 1}
          helperText={vehicleRegistration.length < 1 ? "Minimum 1 character" : ""}
          sx={{ width: 220 }}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5, alignSelf: "flex-start", mt: "8px" }}>
          {["Today", "12 Hours", "24 Hours", "7 Days"].map((label) => (
            <Button key={label} variant="outlined" size="small" onClick={() => applyRange(label)}>
              {label}
            </Button>
          ))}
        </Box>
        <Button
          variant="outlined"
          onClick={onReset}
          disabled={loading}
          sx={{ alignSelf: "flex-start", mt: "8px", height: 56 }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={onSearch}
          disabled={loading || vehicleRegistration.length < 1 || dateRangeInvalid}
          sx={{ alignSelf: "flex-start", mt: "8px", height: 56 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
        </Button>
      </Stack>
    </LocalizationProvider>
  );
}
