<?php
namespace Backend\Service;

class PhpGenerator
{
    /**
     * Lines
     *
     * @var array
     */
    protected $lines;

    /**
     * Input/Output File Path
     *
     * @var string
     */
    protected $file;

    /**
     * Set Lines
     *
     * @param array $lines
     * @return PoGenerator
     */
    public function setLines($lines)
    {
        $this->lines = $lines;
        return $this;
    }

    /**
     * Set input file
     *
     * @param string $file
     * @return PoGenerator
     */
    public function setFile($file)
    {
        $this->file = $file;
        return $this;
    }

    public function create()
    {
        if (empty($this->lines)) {
            return false;
        }

        $arrayTemplate = "<?php\n\n
return array(\n
%s
);\n
";

        $oldData = array();
        if (file_exists($this->file)) {
            $oldData = include $this->file;
            $tmpOldData = $oldData;
        }

        $rows = '';

        //handle existing rows
        foreach ($this->lines as $k => $line) {
            //Check if old key exists
            if (key_exists($line, $oldData)) {
                $rows .= "\t'{$line}' => '{$oldData[$line]}',\n";
                unset($tmpOldData[$line]);
            }
        }

        // keep manually adde records into file
        foreach ($tmpOldData as $k => $line) {
            $rows .= "\t'{$k}' => '{$line}',\n";
        }

        //handle new rows
        foreach ($this->lines as $k => $line) {
            //Check if old key exists
            if (!key_exists($line, $oldData)) {
                $rows .= "\t'{$line}' => '',\n";
            }
        }

        //save template to file
        $file = fopen($this->file, 'w+') or die('Could not open file ' . $this->file);
        fwrite($file, sprintf($arrayTemplate, $rows));
        fclose($file);

        return true;
    }
}