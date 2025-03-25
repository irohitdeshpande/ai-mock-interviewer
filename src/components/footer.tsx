// const Footer = () => {
//   return (
//     <footer className="w-full text-center py-4 bg-gray-100 text-gray-600 border-t border-gray-300">
//       © {new Date().getFullYear()} Rohit Deshpande. All rights reserved.
//     </footer>
//   );
// };

// export default Footer;
// Compare this snippet from src/components/footer.tsx:
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-2 bg-gray-100 text-gray-600 border-t border-gray-300">
      © {new Date().getFullYear()} Rohit Deshpande. All rights reserved.
    </footer>
  );
};

export default Footer;