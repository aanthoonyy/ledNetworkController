import React from "react";
import type { NodeInfoPanelProps } from "../Interface/INetwork";
import {
  Sheet,
  IconButton,
  Typography,
  Box,
  Select,
  Option,
  Chip,
  Stack,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";

type NodeState = "on" | "off" | "blinking" | "pulse";
type NodeColor = "primary" | "success" | "warning" | "danger" | "neutral";

const colorOptions = [
  { value: "primary", label: "Blue" },
  { value: "success", label: "Green" },
  { value: "warning", label: "Yellow" },
  { value: "danger", label: "Red" },
  { value: "neutral", label: "Gray" },
];

const StateIndicator = ({
  state,
  color,
}: {
  state: NodeState;
  color: NodeColor;
}) => {
  return (
    <Chip
      variant="soft"
      color={color}
      startDecorator={
        <CircleIcon
          sx={{
            fontSize: "0.8rem",
            animation:
              state === "blinking"
                ? "blink 1s infinite"
                : state === "pulse"
                ? "pulse 2s infinite"
                : "none",
            "@keyframes blink": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.3 },
            },
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.2)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />
      }
    >
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </Chip>
  );
};

export const NodeInfoPanel = ({ node, onClose }: NodeInfoPanelProps) => {
  if (!node) return null;
  const [state, setState] = React.useState<NodeState>("on");
  const [color, setColor] = React.useState<NodeColor>("primary");

  return (
    <Sheet
      variant="outlined"
      sx={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 320,
        p: 2,
        boxShadow: "lg",
        borderLeft: "1px solid",
        borderColor: "divider",
        bgcolor: "background.surface",
        transform: "translateX(0)",
        transition: "transform 0.01s ease-in-out",
        animation: "slideIn 0.01s ease-out",
        "@keyframes slideIn": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography level="title-lg" sx={{ fontWeight: "bold" }}>
          Node Details
        </Typography>
        <IconButton
          variant="plain"
          color="neutral"
          onClick={onClose}
          sx={{ "&:hover": { bgcolor: "neutral.softHover" } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: "sm",
          bgcolor: "background.level1",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography level="h4" sx={{ mb: 0.5 }}>
          {node.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography level="body-sm" textColor="neutral.500">
            {node.type || "Unknown Device Type"}
          </Typography>
          <StateIndicator state={state} color={color} />
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              State
            </Typography>
            <Select
              value={state}
              onChange={(_, newValue) => setState(newValue as NodeState)}
              size="sm"
              sx={{ width: "100%" }}
            >
              <Option value="on">On</Option>
              <Option value="off">Off</Option>
              <Option value="blinking">Blinking</Option>
              <Option value="pulse">Pulse</Option>
            </Select>
          </Box>

          <Box>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Color
            </Typography>
            <Select
              value={color}
              onChange={(_, newValue) => setColor(newValue as NodeColor)}
              size="sm"
              sx={{ width: "100%" }}
            >
              {colorOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Box>
        </Stack>
      </Box>
    </Sheet>
  );
};
