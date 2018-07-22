<?php
namespace Application\Entity\Hydrator;

use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Zend\Hydrator\Filter\FilterProviderInterface;
use Doctrine\Common\Util\Inflector;

class Translations extends DoctrineHydrator
{

    public function getEntityManager()
    {
        return $this->objectManager;
    }

    public function extractArray($object)
    {
        $this->prepare($object);
        $fieldNames = $this->metadata->getFieldNames();
        $associationNames = $this->metadata->getAssociationNames();
        $methods = get_class_methods($object);

        $data = [];
        foreach ($fieldNames as $fieldName) {
            $getter = 'get' . Inflector::classify($fieldName);
            $isser = 'is' . Inflector::classify($fieldName);

            $dataFieldName = $this->computeExtractFieldName($fieldName);

            if (in_array($getter, $methods)) {
                $value = $this->extractValue($fieldName, $object->$getter(), $object);
                $data[$dataFieldName] = $value;
            }
        }
        foreach ($associationNames as $fieldName) {
            $getter = 'get' . Inflector::classify($fieldName);
            $isser = 'is' . Inflector::classify($fieldName);

            $dataFieldName = $this->computeExtractFieldName($fieldName);

            if( $fieldName == 'translations'){
                $data[$dataFieldName] = $this->extractTranslations($fieldName, $object);
            } elseif (in_array($getter, $methods) && $this->metadata->isSingleValuedAssociation($fieldName)) {
                $data[$dataFieldName] = $this->extractObject($fieldName, $object);
            } elseif(in_array($getter, $methods) && $this->metadata->isCollectionValuedAssociation($fieldName)){
                $data[$dataFieldName] = $this->extractCollection($fieldName, $object);
            }
        }

        return $data;
    }

    public function extractObject($name, $object)
    {
        $entry = $object->__get($name);
        return ($entry)?$entry->getId():null;
    }

    public function extractCollection($name, $object)
    {
        $data = [];
        $entries = $object->__get($name);
        foreach ($entries as $entry){
            $data[] = $entry->getId();
        }
        return $data;
    }

    /**
     * Extract values from an object using a by-value logic (this means that it uses the entity
     * API, in this case, getters)
     *
     * @param object $object
     * @throws RuntimeException
     * @return array
     */
    protected function extractByValue($object)
    {
        $fieldNames = array_merge($this->metadata->getFieldNames(), $this->metadata->getAssociationNames());
        $methods = get_class_methods($object);
        $filter = $object instanceof FilterProviderInterface ? $object->getFilter() : $this->filterComposite;

        $data = [];
        foreach ($fieldNames as $fieldName) {
            if ($filter && ! $filter->filter($fieldName)) {
                continue;
            }

            $getter = 'get' . Inflector::classify($fieldName);
            $isser = 'is' . Inflector::classify($fieldName);

            $dataFieldName = $this->computeExtractFieldName($fieldName);

            if ($fieldName == 'translations') {
                $data[$dataFieldName] = $this->extractTranslations($fieldName, $object);
            } elseif (in_array($getter, $methods)) {
                $data[$dataFieldName] = $this->extractValue($fieldName, $object->$getter(), $object);
            } elseif (in_array($isser, $methods)) {
                $data[$dataFieldName] = $this->extractValue($fieldName, $object->$isser(), $object);
            } elseif (substr($fieldName, 0, 2) === 'is' && ctype_upper(substr($fieldName, 2, 1)) && in_array($fieldName, $methods)) {
                $data[$dataFieldName] = $this->extractValue($fieldName, $object->$fieldName(), $object);
            }

            // Unknown fields are ignored
        }

        return $data;
    }

    public function extractInArray($name, $object)
    {
        $data = [];
        $entries = $object->__get($name);
        foreach ($entries as $entry) {
            $data[] = $entry->getId();
        }
        return $data;
    }

    public function extractTranslations($name, $object)
    {
        $data = [];
        $entries = $object->__get('translations');
        foreach ($entries as $entry) {
            $data[$entry->getLocale()][$entry->getField()] = $entry->getContent();
        }

        return $data;
    }

    /**
     * Hydrate $object with the provided $data.
     *
     * @param array $data
     * @param object $object
     * @return object
     */
    public function hydrate(array $data, $object)
    {
        $this->prepare($object);

        if ($this->byValue) {
            return $this->hydrateByValue($data, $object);
        }

        return $this->hydrateByReference($data, $object);
    }

    /**
     * Hydrate the object using a by-value logic (this means that it uses the entity API, in this
     * case, setters)
     *
     * @param array $data
     * @param object $object
     * @throws RuntimeException
     * @return object
     */
    protected function hydrateByValue(array $data, $object)
    {
        $tryObject = $this->tryConvertArrayToObject($data, $object);
        $metadata = $this->metadata;

        if (is_object($tryObject)) {
            $object = $tryObject;
        }

        foreach ($data as $field => $value){
            $field = $this->computeHydrateFieldName($field);
            $value = $this->handleTypeConversions($value, $metadata->getTypeOfField($field));

            if ($field == 'translations') {
                $translations = [];

                foreach ($value as $locale => $trEntry){
                    foreach ($trEntry as $key => $val){
                        $id = null;
                        if($object->getId())
                        {
                            $exist = $this->getEntityManager()->getRepository($metadata->getName())->findTranslation($object, $locale, $key);
                            if($exist){
                                $id = $exist->getId();
                            }
                        }
                        if($val != ''){
                            $translations[] = [
                                'locale' => $locale,
                                'field' => $key,
                                'content' => $val,
                                'id' => $id,
                            ];
                        }
                    }
                }
                $data[$field] = $translations;
            }
        }

        foreach ($data as $field => $value) {
            $field = $this->computeHydrateFieldName($field);
            $value = $this->handleTypeConversions($value, $metadata->getTypeOfField($field));
            $setter = 'set' . Inflector::classify($field);

            if ($metadata->hasAssociation($field)) {
                $target = $metadata->getAssociationTargetClass($field);

                if ($metadata->isSingleValuedAssociation($field)) {
                    if (! is_callable([
                        $object,
                        $setter
                    ])) {
                        continue;
                    }

                    $value = $this->toOne($target, $this->hydrateValue($field, $value, $data));

                    if (null === $value && ! current($metadata->getReflectionClass()
                        ->getMethod($setter)
                        ->getParameters())->allowsNull()) {
                        continue;
                    }

                    $object->$setter($value);
                } elseif ($metadata->isCollectionValuedAssociation($field)) {
                    $this->toMany($object, $field, $target, $value);
                }
            } else {
                if (! is_callable([
                    $object,
                    $setter
                ])) {
                    continue;
                }

                $object->$setter($this->hydrateValue($field, $value, $data));
            }
        }

        return $object;
    }
}