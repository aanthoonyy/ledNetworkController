import type { NodeInfoPanelProps } from "../Interface/INetwork";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const InfoItem = ({ label, value }: { label: any; value: any }) => (
  <ListItem>
    <ListItemText primary={label} secondary={value} />
  </ListItem>
);

export const NodeInfoPanel = ({ node, onClose }: NodeInfoPanelProps) => {
  if (!node) return null;

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: { width: 300, p: 2 },
      }}
    >
      <Box>
        <IconButton onClick={onClose} sx={{ float: "right" }}>
          <CloseIcon />
        </IconButton>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">{node.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {node.type || "Unknown Device Type"}
          </Typography>
        </Box>

        <List>
          <InfoItem label="IP Address" value={node.ip || "Not configured"} />
          <InfoItem label="Node ID" value={node.id} />
          <InfoItem label="Device Type" value={node.type || "Unknown"} />
        </List>
      </Box>
    </Drawer>
  );
};
