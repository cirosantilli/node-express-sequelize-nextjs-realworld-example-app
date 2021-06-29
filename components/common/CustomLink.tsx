/* Helper for a link that accepts parameters such as className */

import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";

interface CustomLinkProps {
  href: string;
  as?: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const CustomLink = ({
  className,
  href,
  as,
  onClick,
  children,
}: CustomLinkProps) => (
  <Link href={href} as={as} passHref>
    <a onClick={onClick} className={className || ""}>
      {children}
    </a>
  </Link>
);

export default CustomLink;
