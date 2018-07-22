<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class CountryRepository extends EntityRepository
{

    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(c.id) as cnt')
            ->from('Application\Entity\Country', 'c');
        if (! empty($search)) {
            $query->andWhere('c.name like :search OR r.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c.id as id', 'c.name as name', 'c.slug as slug')
            ->from('Application\Entity\Country', 'c')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('c.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c.id', 'c.name')
            ->from('Application\Entity\Country', 'c')
            ->orderBy('c.name', 'ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry) {
            $data[$entry['id']] = $entry['name'];
        }
        return $data;
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Country', 'c')
            ->where('c.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function search($search)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c')
            ->from('Application\Entity\Country', 'c')
            ->where('c.name like :search')
            ->setParameter('search', $search)
            ->setMaxResults(1);

        return $query->getQuery()->getOneOrNullResult();
    }

    public function getBySlug($slug, $locale = null)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c.id', 'c.name')
            ->from('Application\Entity\Country', 'c')
            ->where('c.slug = :slug')
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
            ->from('Application\Entity\Translation\CountryTranslation', 't')
            ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
            ->setParameter('object', $object)
            ->setParameter('locale', $locale)
            ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}