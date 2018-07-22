<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class PageRepository extends EntityRepository
{

    public function updateEmptySlugs()
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('a')
            ->from('Application\Entity\Page', 'a')
            ->where("a.slug IS NULL OR a.slug = ''");

        $results = $query->getQuery()->getResult();
        foreach ($results as $entry) {
            $entry->setSlug(null);
        }
        $this->getEntityManager()->flush();
    }

    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(a.id) as cnt')->from('Application\Entity\Page', 'a');
        if (! empty($search)) {
            $query->andWhere('a.title like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('a.id as id', 'a.title as title', 'a.slug as slug')
            ->from('Application\Entity\Page', 'a')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('a.title like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('a.id', 'a.title')
            ->from('Application\Entity\Page', 'a')
            ->orderBy('a.title', 'ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry) {
            $data[$entry['id']] = $entry['title'];
        }
        return $data;
    }

    public function getPage($slug, $locale = null)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('p.title', 'p.content')
            ->from('Application\Entity\Page', 'p')
            ->where('p.slug = :slug')
            ->setParameter('slug', $slug);

        if ($locale != null) {
            $q = $query->getQuery();
            $q->setHint(\Doctrine\ORM\Query::HINT_CUSTOM_OUTPUT_WALKER, 'Gedmo\\Translatable\\Query\\TreeWalker\\TranslationWalker');
            $q->setHint(\Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE, $locale);
            return $q->getOneOrNullResult();
        }

        return $query->getQuery()->getOneOrNullResult();
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Page', 'a')
            ->where('a.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function findTranslation($object, $locale, $field)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('t')
            ->from('Application\Entity\Translation\PageTranslation', 't')
            ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
            ->setParameter('object', $object)
            ->setParameter('locale', $locale)
            ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}