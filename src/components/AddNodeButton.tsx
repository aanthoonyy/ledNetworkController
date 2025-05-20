import { Button } from "@mui/material";
import { useNetworkStore } from "../store/networkStore";

export const AddNodeButton = () => {
  const addPurpleNode = useNetworkStore((state) => state.addPurpleNode);

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={addPurpleNode}
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      Add Purple Node
    </Button>
  );
};
