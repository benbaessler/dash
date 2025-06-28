import { createSystem } from "frog/ui";
import { heroicons } from "frog/ui/icons";

export const {
  Box,
  Columns,
  Column,
  Heading,
  HStack,
  Icon,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  Image,
  vars,
} = createSystem({
  colors: {
    background: "#000000",
    secondaryBg: "#2C2C2C",
    text: "#FFFFFF",
    textSecondary: "#9C9C9C",
    border: "#6547de",
  },
  fonts: {
    default: [
      {
        name: "Inter",
        source: "google",
        weight: 400,
      },
      {
        name: "Inter Bold",
        source: "google",
        weight: 700,
      },
    ],
  },
  icons: heroicons,
});
