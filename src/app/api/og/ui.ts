import { createSystem } from "frog/ui"
import { heroicons } from "frog/ui/icons"

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
    background: '#000000',
    videoBg: "#262626",
    text: '#FFFFFF',
  },
  fonts: {
    default: [
      {
        name: 'DM Sans',
        source: 'google',
        weight: 400,
      },
      {
        name: 'DM Sans Bold',
        source: 'google',
        weight: 700,
      },
    ],
  },
  icons: heroicons,
})