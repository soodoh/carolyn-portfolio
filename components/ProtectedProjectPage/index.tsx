"use client";

import PasswordProtected from "@/components/PasswordProtected";
import ProjectInfoPage from "@/components/ProjectInfoPage";
import { useState } from "react";
import type { ProjectInfo } from "@/lib/types";

const ProtectedProjectPage = ({
  projectInfo,
}: {
  projectInfo: ProjectInfo;
}) => {
  const [authenticated, setAuthenticated] = useState(false);

  if (projectInfo.password && !authenticated) {
    return (
      <PasswordProtected
        password={projectInfo.password}
        onAuth={() => setAuthenticated(true)}
      />
    );
  }
  return <ProjectInfoPage projectInfo={projectInfo} />;
};

export default ProtectedProjectPage;
