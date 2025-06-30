import { ExploreClient } from "@/components/explore/explore-component";
import { AppLayout } from "@/components/layout/app-layout";
import React from "react";

async function ExplorePage() {
  return (
    <AppLayout>
      <ExploreClient />
    </AppLayout>
  );
}

export default ExplorePage;
