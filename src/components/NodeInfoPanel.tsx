import type { NodeInfoPanelProps } from "../Interface/INetwork";
import {
  Sheet,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemContent,
  Divider,
  Box,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

const InfoItem = ({ label, value }: { label: any; value: any }) => (
  <ListItem>
    <ListItemContent>
      <Typography level="body-sm" textColor="neutral.500">
        {label}
      </Typography>
      <Typography level="body-md">{value}</Typography>
    </ListItemContent>
  </ListItem>
);

export const NodeInfoPanel = ({ node, onClose }: NodeInfoPanelProps) => {
  if (!node) return null;

  return (
    <Sheet
      variant="outlined"
      sx={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 300,
        p: 2,
        boxShadow: "lg",
        borderLeft: "1px solid",
        borderColor: "divider",
        bgcolor: "background.surface",
        transform: "translateX(0)",
        transition: "transform 0.01s ease-in-out",
        animation: "slideIn 0.01s ease-out",
        "@keyframes slideIn": {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton
          variant="plain"
          color="neutral"
          onClick={onClose}
          sx={{ "&:hover": { bgcolor: "neutral.softHover" } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography level="h4" sx={{ mb: 0.5 }}>
          {node.name}
        </Typography>
        <Typography level="body-sm" textColor="neutral.500">
          {node.type || "Unknown Device Type"}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List
        size="sm"
        sx={{
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "0",
        }}
      >
        <InfoItem label="IP Address" value={node.ip || "Not configured"} />
        <InfoItem label="Node ID" value={node.id} />
        <InfoItem label="Device Type" value={node.type || "Unknown"} />
      </List>
    </Sheet>
  );
};
