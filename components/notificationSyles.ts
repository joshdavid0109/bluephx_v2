import { StyleSheet } from "react-native";

export default StyleSheet.create({
container: {
    position: "relative",
    marginRight: 12, // spacing between bell and logo
    },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    elevation: 6,
  },

  title: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },

  empty: {
    textAlign: "center",
    color: "#64748B",
    paddingVertical: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  text: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});
