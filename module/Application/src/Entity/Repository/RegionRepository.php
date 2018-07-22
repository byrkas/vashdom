<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class RegionRepository extends EntityRepository
{

    public function findByName($name)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('r')
            ->from('Application\Entity\Region', 'r')
            ->where('r.name like :name')
            ->setParameter('name', '%' . $name . '%')
            ->setMaxResults(1);

        return $query->getQuery()->getOneOrNullResult();
    }

    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(r.id) as cnt')->from('Application\Entity\Region', 'r');
        if (! empty($search)) {
            $query->andWhere('r.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('r.id', 'r.name', 'r.slug','r.description', 'r.sort')
            ->from('Application\Entity\Region', 'r')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy('r.' . $orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('r.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('r.id', 'r.name')
            ->from('Application\Entity\Region', 'r')
            ->orderBy('r.name', 'ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry) {
            $data[$entry['id']] = $entry['name'];
        }
        return $data;
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Region', 'r')
            ->where('r.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function getBySlug($slug, $locale)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('r.id', 'r.name')
            ->from('Application\Entity\Region', 'r')
            ->where('r.slug = :slug')
            ->setParameter('slug', $slug);

        if ($locale != null) {
            $q = $query->getQuery();
            $q->setHint(\Doctrine\ORM\Query::HINT_CUSTOM_OUTPUT_WALKER, 'Gedmo\\Translatable\\Query\\TreeWalker\\TranslationWalker');
            $q->setHint(\Gedmo\Translatable\TranslatableListener::HINT_TRANSLATABLE_LOCALE, $locale);
            return $q->getOneOrNullResult();
        }

        return $query->getQuery()->getOneOrNullResult();
    }

    public function findTranslation($object, $locale, $field)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('t')
            ->from('Application\Entity\Translation\RegionTranslation', 't')
            ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
            ->setParameter('object', $object)
            ->setParameter('locale', $locale)
            ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}