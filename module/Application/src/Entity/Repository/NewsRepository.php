<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class NewsRepository extends EntityRepository
{

    public function updateEmptySlugs()
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('n')
            ->from('Application\Entity\News', 'n')
            ->where("n.slug IS NULL OR n.slug = ''");

        $results = $query->getQuery()->getResult();
        foreach ($results as $entry) {
            $entry->setSlug(null);
        }
        $this->getEntityManager()->flush();
    }

    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(n.id) as cnt')->from('Application\Entity\News', 'n');
        if (! empty($search)) {
            $query->andWhere('n.title like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('n.id as id', 'n.title as title', 'n.slug as slug', 'n.isPublished as isPublished','n.publishDate as publishDate')
            ->from('Application\Entity\News', 'n')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('n.title like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('a.id', 'a.title')
            ->from('Application\Entity\News', 'a')
            ->orderBy('a.title', 'ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry) {
            $data[$entry['id']] = $entry['title'];
        }
        return $data;
    }

    public function getNews($slug, $locale = null)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('n.title', 'n.content','n.publishDate')
            ->from('Application\Entity\News', 'n')
            ->where('n.slug = :slug AND n.isPublished = 1')
            ->setParameter('slug', $slug);

        if ($locale != null) {
            $q = $query->getQuery();
            $q->setHint(\Doctrine\ORM\Query::HINT_CUSTOM_OUTPUT_WALKER, 'Gedmo\\Translatable\\Query\\TreeWalker\\TranslationWalker');
            $q->setHint(\Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE, $locale);
            return $q->getOneOrNullResult();
        }

        return $query->getQuery()->getOneOrNullResult();
    }

    public function getLatesNews($limit = 3, $locale = null)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('n.title', 'n.description','n.slug','n.publishDate')
        ->from('Application\Entity\News', 'n')
        ->where('n.isPublished = 1 AND n.publishDate < :date')
        ->orderBy('n.publishDate','DESC')
        ->setParameter('date', date('Y-m-d H:i:s'));

        if ($locale != null) {
            $q = $query->getQuery();
            $q->setHint(\Doctrine\ORM\Query::HINT_CUSTOM_OUTPUT_WALKER, 'Gedmo\\Translatable\\Query\\TreeWalker\\TranslationWalker');
            $q->setHint(\Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE, $locale);
            return $q->getArrayResult();
        }

        return $query->getQuery()->getArrayResult();
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\News', 'n')
            ->where('n.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function findTranslation($object, $locale, $field)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('t')
            ->from('Application\Entity\Translation\NewsTranslation', 't')
            ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
            ->setParameter('object', $object)
            ->setParameter('locale', $locale)
            ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}