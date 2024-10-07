import { useRouter } from "next/router";
import Layout from "../../app/layout";
import SuperTranslator from "../../app/components/SuperTranslator";

const DynamicPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // Ensure that `id` is a string
  const translationJobId = Array.isArray(id) ? id[0] : id;

  return (
    <Layout>
      <SuperTranslator id={translationJobId} />
    </Layout>
  );
};

export default DynamicPage;
